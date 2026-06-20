import { Shift, IShift } from '../models/shift_model';
import { UserModel } from '../models/user_model';
import { AppError } from '../errors/AppError';
import { Types } from 'mongoose';

// Parameter interfaces for better TypeScript support
interface GetShiftsParams {
  page: number;
  limit: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface CreateShiftData {
  title: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  userId: string;
  companyId: string;
  description?: string;
  notes?: string;
  assignedBy?: string;
  assignedTo: {
    userId?: string;
    name?: string;
  };
}

interface UpdateShiftData {
  title?: string;
  date?: string | Date;
  startTime?: string;
  endTime?: string;
  status?: 'SCHEDULED' | 'COMPLETED' | 'MISSED';
  notes?: string;
  description?: string;
  assignedTo?: {
    userId?: Types.ObjectId | undefined;
    name?: string;
  };
}

/**
 * Shift Service - Handles all shift-related business logic with enhanced features
 */
export class ShiftService {
  /**
   * Create a new shift and assign it to an employee
   */
  static async create(data: CreateShiftData): Promise<IShift> {
  const { companyId, assignedBy, date, startTime, endTime, assignedTo } = data;

  // Validate assignedTo
  if (!assignedTo || (!assignedTo.userId && !assignedTo.name?.trim())) {
    throw new AppError('assignedTo must contain either userId or name', 400);
  }

  const shiftDate = new Date(date);
  if (isNaN(shiftDate.getTime())) {
    throw new AppError('Invalid date format', 400);
  }

  let targetUserId: string | null = null;

  // If assignedTo.userId exists → validate user in company
  if (assignedTo.userId) {
    if (!Types.ObjectId.isValid(assignedTo.userId)) {
      throw new AppError('Invalid userId in assignedTo', 400);
    }

    const employee = await UserModel.findOne({
      _id: assignedTo.userId,
      companyId: new Types.ObjectId(companyId)
    }).lean();

    if (!employee) {
      throw new AppError('Employee not found in this company', 404);
    }

    targetUserId = assignedTo.userId;
  } else {
    // Only name → no userId, no conflict check, no assignedShifts
    targetUserId = null;
  }

  // Validate assignedBy
  if (assignedBy && !Types.ObjectId.isValid(assignedBy)) {
    throw new AppError('Invalid assignedBy ID', 400);
  }

  // Only check conflicts if assigned to a real user
  if (targetUserId) {
    await this.checkShiftConflicts(targetUserId, shiftDate, startTime, endTime);
  }

  try {
    const shift = new Shift({
      ...data,
      date: shiftDate,
      companyId: new Types.ObjectId(companyId),
      assignedBy: assignedBy ? new Types.ObjectId(assignedBy) : undefined,
      userId: targetUserId ? new Types.ObjectId(targetUserId) : undefined,
      assignedTo: {
        userId: assignedTo.userId ? new Types.ObjectId(assignedTo.userId) : undefined,
        name: assignedTo.name?.trim(),
      },
    });

    await shift.save();

    // Only update assignedShifts if real user
    if (targetUserId) {
      await UserModel.updateOne(
        { _id: targetUserId },
        { $addToSet: { assignedShifts: shift._id } }
      );
    }

    const populatedShift = await Shift.findById(shift._id)
      .populate('userId', 'name email role')
      .populate('assignedBy', 'name')
      .lean();

    return populatedShift!;
  } catch (error: any) {
    if (error.code === 11000) {
      throw new AppError('Shift conflict detected', 409);
    }
    throw error;
  }
}
  /**
   * Get shifts for a specific employee with enhanced filtering
   */
  static async getEmployeeShifts(
    userId: string,
    companyId: string,
    params: GetShiftsParams = { page: 1, limit: 10 }
  ): Promise<{
    shifts: IShift[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new AppError('Invalid user ID', 400);
    }

    const { page, limit, status, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;
    
    const filter: any = { 
      userId: new Types.ObjectId(userId), 
      companyId: new Types.ObjectId(companyId) 
    };

    // Enhanced filtering
    if (status) filter.status = status;
    
    // Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [shifts, total] = await Promise.all([
      Shift.find(filter)
        .populate('userId', 'name email')
        .populate('assignedBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Shift.countDocuments(filter),
    ]);

    return {
      shifts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get all shifts in the company (Manager view) with enhanced filtering
   */
  static async getCompanyShifts(
    companyId: string,
    params: GetShiftsParams & { userId?: string } = { page: 1, limit: 10 }
  ): Promise<{
    shifts: IShift[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    if (!Types.ObjectId.isValid(companyId)) {
      throw new AppError('Invalid company ID', 400);
    }

    const { page, limit, status, userId, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;
    
    const filter: any = { companyId: new Types.ObjectId(companyId) };
    
    // Enhanced filtering
    if (status) filter.status = status;
    if (userId) filter.userId = new Types.ObjectId(userId);
    
    // Date range filtering
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    // Add secondary sort for consistent ordering
    if (sortBy !== 'date') sort.date = -1;

    const [shifts, total] = await Promise.all([
      Shift.find(filter)
        .populate('userId', 'name email role')
        .populate('assignedBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Shift.countDocuments(filter),
    ]);

    return {
      shifts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a specific shift by ID with company validation
   */
  static async getShiftById(shiftId: string, companyId: string): Promise<IShift | null> {
    if (!Types.ObjectId.isValid(shiftId) || !Types.ObjectId.isValid(companyId)) {
      throw new AppError('Invalid shift or company ID', 400);
    }

    const shift = await Shift.findOne({ 
      _id: new Types.ObjectId(shiftId), 
      companyId: new Types.ObjectId(companyId) 
    })
      .populate('userId', 'name email role')
      .populate('assignedBy', 'name')
      .lean();

    return shift;
  }

  /**
   * Update shift details with enhanced validation
   */
  static async update(
  shiftId: string,
  updates: UpdateShiftData,
  updatedBy?: string
): Promise<IShift | null> {
  if (!Types.ObjectId.isValid(shiftId)) {
    throw new AppError('Invalid shift ID', 400);
  }

  const shift = await Shift.findById(shiftId);
  if (!shift) throw new AppError('Shift not found', 404);

  // Handle assignedTo update
  if (updates.assignedTo) {
    const { userId, name } = updates.assignedTo;
    if (!userId && !name?.trim()) {
      throw new AppError('assignedTo must contain either userId or name', 400);
    }

    let newUserId: Types.ObjectId | undefined = undefined;

    if (userId) {
      if (!Types.ObjectId.isValid(userId)) throw new AppError('Invalid userId', 400);
      const employee = await UserModel.findOne({ _id: userId, companyId: shift.companyId });
      if (!employee) throw new AppError('Employee not found in company', 404);
      newUserId = new Types.ObjectId(userId);
    }

    // Remove from old user
    if (shift.userId) {
      await UserModel.updateOne(
        { _id: shift.userId },
        { $pull: { assignedShifts: shift._id } }
      );
    }

    // Update shift
    shift.userId = newUserId || undefined;
    shift.assignedTo = {
      userId: userId ? new Types.ObjectId(userId) : undefined,
      name: name?.trim(),
    };

    // Add to new user
    if (newUserId) {
      await UserModel.updateOne(
        { _id: newUserId },
        { $addToSet: { assignedShifts: shift._id } }
      );
    }
  }

  // Handle time/date conflicts if changed
  if (updates.date || updates.startTime || updates.endTime) {
    const checkDate = updates.date ? new Date(updates.date) : shift.date;
    const checkStart = updates.startTime || shift.startTime;
    const checkEnd = updates.endTime || shift.endTime;

    if (shift.userId) {
      await this.checkShiftConflicts(
        shift.userId.toString(),
        checkDate,
        checkStart,
        checkEnd,
        shiftId
      );
    }
  }

  // Apply other updates
  Object.assign(shift, updates);
  if (updates.assignedTo) {
    shift.assignedTo = updates.assignedTo;
  }

  await shift.save();

  return Shift.findById(shiftId)
    .populate('userId', 'name email role')
    .populate('assignedBy', 'name')
    .lean();
}

  /**
   * Delete a shift and remove from employee's list with enhanced cleanup
   */
  static async delete(shiftId: string, deletedBy?: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(shiftId)) {
      throw new AppError('Invalid shift ID', 400);
    }

    const shift = await Shift.findById(shiftId).lean();
    if (!shift) return false;

    // Remove from employee's assignedShifts
    await UserModel.updateOne(
      { _id: shift.userId },
      { $pull: { assignedShifts: new Types.ObjectId(shiftId) } }
    );

    // Delete shift
    const result = await Shift.deleteOne({ _id: new Types.ObjectId(shiftId) });
    return result.deletedCount > 0;
  }

  /**
   * Get shifts for multiple employees (useful for team views)
   */
  static async getTeamShifts(
    userIds: string[],
    companyId: string,
    params: GetShiftsParams = { page: 1, limit: 10 }
  ): Promise<{
    shifts: IShift[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }> {
    // Validate all user IDs
    const validUserIds = userIds.filter(id => Types.ObjectId.isValid(id));
    if (validUserIds.length === 0) {
      throw new AppError('No valid user IDs provided', 400);
    }

    const { page, limit, status, startDate, endDate, sortBy = 'date', sortOrder = 'desc' } = params;
    const skip = (page - 1) * limit;
    
    const filter: any = { 
      userId: { $in: validUserIds.map(id => new Types.ObjectId(id)) },
      companyId: new Types.ObjectId(companyId) 
    };

    if (status) filter.status = status;
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [shifts, total] = await Promise.all([
      Shift.find(filter)
        .populate('userId', 'name email role')
        .populate('assignedBy', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Shift.countDocuments(filter),
    ]);

    return {
      shifts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Utility method to check for shift conflicts
   */
  private static async checkShiftConflicts(
    userId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeShiftId?: string
  ): Promise<void> {
    const startDateTime = new Date(date);
    const [startH, startM] = startTime.split(':').map(Number);
    startDateTime.setHours(startH, startM, 0, 0);

    const endDateTime = new Date(date);
    const [endH, endM] = endTime.split(':').map(Number);
    endDateTime.setHours(endH, endM, 0, 0);

    // Handle overnight shifts
    if (endDateTime <= startDateTime) {
      endDateTime.setDate(endDateTime.getDate() + 1);
    }

    const conflictFilter: any = {
     userId: new Types.ObjectId(userId),
      $or: [
        // New shift starts during existing shift
        {
          start: { $lt: endDateTime },
          end: { $gt: startDateTime }
        }
      ]
    };

  if (excludeShiftId) {
    conflictFilter._id = { $ne: new Types.ObjectId(excludeShiftId) };
  }

  const conflictingShift = await Shift.findOne(conflictFilter).lean();

  if (conflictingShift) {
    throw new AppError(
      `Shift conflicts with existing shift: ${conflictingShift.title} (${conflictingShift.startTime} - ${conflictingShift.endTime})`,
      409
    );
  }
}

  /**
   * Utility method to validate time format
   */
  private static isValidTimeFormat(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time);
  }

  /**
   * Bulk update shift statuses (useful for batch operations)
   */
  static async bulkUpdateStatus(
    shiftIds: string[],
    status: 'SCHEDULED' | 'COMPLETED' | 'MISSED',
    updatedBy?: string
  ): Promise<{ modifiedCount: number }> {
    const validShiftIds = shiftIds.filter(id => Types.ObjectId.isValid(id));
    
    if (validShiftIds.length === 0) {
      throw new AppError('No valid shift IDs provided', 400);
    }

    const result = await Shift.updateMany(
      { _id: { $in: validShiftIds.map(id => new Types.ObjectId(id)) } },
      { status }
    );

    return { modifiedCount: result.modifiedCount };
  }
}