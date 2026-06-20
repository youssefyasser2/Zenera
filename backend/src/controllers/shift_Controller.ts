// src/controllers/shift_controller.ts
import { Response, NextFunction } from 'express';
import { ShiftService } from '../services/shift_service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { UserRole } from '../constant/role';
import { Shift } from '../models/shift_model';

/* -------------------------------------------------------------
   Helper – centralised error response (keeps every handler DRY)
   ------------------------------------------------------------- */
function sendError(res: Response, err: unknown, defaultMessage: string) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  const message = err instanceof Error ? err.message : 'Unknown error';
  return res.status(500).json({
    success: false,
    message: defaultMessage,
    error: message,
  });
}

/* -------------------------------------------------------------
   Controller
   ------------------------------------------------------------- */
export class ShiftController {
  /** POST /api/shifts – create a shift (Manager / Admin only) */
 static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
try {
    const manager = req.user!;
    if (!manager.companyId) throw new AppError('User has no company assigned', 400);
    if (![UserRole.MANAGER, UserRole.ADMIN].includes(manager.role)) {
      throw new AppError('Manager or Admin access required', 403);
    }
const { title, date, startTime, endTime, assignedTo, description, notes } = req.body;

// Validate required fields
if (!title || !date || !startTime || !endTime || !assignedTo) {
      throw new AppError('Title, date, startTime, endTime, and assignedTo are required', 400);
    }

    if (!assignedTo.userId && !assignedTo.name?.trim()) {
      throw new AppError('assignedTo must contain either userId or name', 400);
    }
const shift = new Shift({
      title,
      date,
      startTime,
      endTime,
      companyId: manager.companyId,
      assignedTo: {
        userId: assignedTo.userId || undefined,
        name: assignedTo.name?.trim() || undefined,
      },
      description,
      notes,
          assignedBy: manager.id.toString(),
    });

    await shift.save();

    logger.info('Shift created successfully', {
      shiftId: shift._id,
      createdBy: manager.id.toString(),
      companyId: manager.companyId.toString(),
    });

    res.status(201).json({
      success: true,
      message: 'Shift created successfully',
      data: { shift },
    });
  } catch (err) {
    sendError(res, err, 'Shift creation failed');
  }
}

  /** GET /api/shifts/employee/:userId */
  static async getEmployeeShifts(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, status } = req.query;
      const currentUser = req.user!;

      if (currentUser.role === UserRole.EMPLOYEE && currentUser.id.toString() !== userId) {
        throw new AppError('You can only view your own shifts', 403);
      }

      const result = await ShiftService.getEmployeeShifts(
        userId,
        currentUser.companyId!.toString(),
        {
          page: Number(page),
          limit: Number(limit),
          status: status as string | undefined,
        }
      );

      res.json({ success: true, data: result });
    } catch (err) {
      sendError(res, err, 'Failed to fetch employee shifts');
    }
  }

  /** GET /api/shifts */
  static async getCompanyShifts(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { page = 1, limit = 10, status, userId } = req.query;
      const currentUser = req.user!;
      const companyId = currentUser.companyId!.toString();

      let result: any;

      if (currentUser.role === UserRole.EMPLOYEE) {
        result = await ShiftService.getEmployeeShifts(
          currentUser.id.toString(),
          companyId,
          {
            page: Number(page),
            limit: Number(limit),
            status: status as string | undefined,
          }
        );
      } else {
        result = await ShiftService.getCompanyShifts(companyId, {
          page: Number(page),
          limit: Number(limit),
          status: status as string | undefined,
          userId: userId as string | undefined,
        });
      }

      res.json({ success: true, data: result });
    } catch (err) {
      sendError(res, err, 'Failed to fetch shifts');
    }
  }

  /** PUT /api/shifts/:id */
  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (![UserRole.MANAGER, UserRole.ADMIN].includes(req.user!.role)) {
        throw new AppError('Manager or Admin access required', 403);
      }

      const shift = await ShiftService.update(id, updates);
      if (!shift) throw new AppError('Shift not found', 404);

      logger.info('Shift updated', { shiftId: id, updatedBy: req.user!.id.toString() });

      res.json({
        success: true,
        message: 'Shift updated successfully',
        data: { shift },
      });
    } catch (err) {
      sendError(res, err, 'Shift update failed');
    }
  }

  /** DELETE /api/shifts/:id */
  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      if (![UserRole.MANAGER, UserRole.ADMIN].includes(req.user!.role)) {
        throw new AppError('Manager or Admin access required', 403);
      }

      const deleted = await ShiftService.delete(id);
      if (!deleted) throw new AppError('Shift not found', 404);

      logger.info('Shift deleted', { shiftId: id, deletedBy: req.user!.id.toString() });

      res.json({ success: true, message: 'Shift deleted successfully' });
    } catch (err) {
      sendError(res, err, 'Shift deletion failed');
    }
  }

  /** GET /api/shifts/my – upcoming shifts for employee */
  static async getMyShifts(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user!.role !== UserRole.EMPLOYEE) {
        throw new AppError('Only employees can access this endpoint', 403);
      }

      const { page = 1, limit = 10 } = req.query;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const result = await ShiftService.getEmployeeShifts(
        req.user!.id.toString(),
        req.user!.companyId!.toString(),
        {
          page: Number(page),
          limit: Number(limit),
          status: 'SCHEDULED',
        }
      );

      const upcomingShifts = result.shifts.filter((shift: any) => {
        const shiftDate = new Date(shift.date);
        return shiftDate >= today;
      });

      res.json({
        success: true,
        data: { shifts: upcomingShifts, pagination: result.pagination },
      });
    } catch (err) {
      sendError(res, err, 'Failed to fetch my shifts');
    }
  }
}