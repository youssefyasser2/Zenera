// src/controllers/timeLogController.ts

import { Request, Response } from 'express';
import { TimeLog } from '../models/TimeLog_model';
import { Shift } from '../models/shift_model';
import { AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

export const timeLogController = {
  // Clock in
  async clockIn(req: AuthRequest, res: Response) {
    try {
      const { shiftId, notes, location } = req.body;

      if (!shiftId) {
        throw new AppError('Shift ID is required', 400);
      }

      // Check if user has an active shift
      const shift = await Shift.findOne({
        _id: shiftId,
        userId: req.user?.id,
        companyId: req.user?.companyId
      });

      if (!shift) {
        throw new AppError('Shift not found or not assigned to you', 404);
      }

      // Check if already clocked in
      const activeClockIn = await TimeLog.findOne({
        userId: req.user?.id,
        isClockedIn: true
      });

      if (activeClockIn) {
        throw new AppError('You are already clocked in. Please clock out first.', 400);
      }

      const timeLog = new TimeLog({
        companyId: req.user?.companyId,
        userId: req.user?.id,
        shiftId,
        clockIn: new Date(),
        notes,
        ...(location && { clockInLocation: location }),
        status: 'CLOCKED_IN'
      });

      await timeLog.save();
      await timeLog.populate('shiftId');

      // Update shift status
      await Shift.findByIdAndUpdate(shiftId, { status: 'IN_PROGRESS' });

      logger.info('User clocked in', {
        userId: req.user?.id,
        shiftId,
        timeLogId: timeLog._id
      });

      res.status(201).json({
        success: true,
        message: 'Clocked in successfully',
        data: { timeLog }
      });
    } catch (error: any) {
      logger.error('Clock in failed', { error: error.message });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to clock in',
        error: error.message
      });
    }
  },

  // Clock out
  async clockOut(req: AuthRequest, res: Response) {
    try {
      const { notes, location } = req.body;

      // Find active clock-in
      const timeLog = await TimeLog.findOne({
        userId: req.user?.id,
        isClockedIn: true
      });

      if (!timeLog) {
        throw new AppError('No active clock-in found', 404);
      }

      timeLog.clockOut = new Date();
      timeLog.notes = notes || timeLog.notes;
      if (location) {
        timeLog.clockOutLocation = location;
      }
      timeLog.isClockedIn = false;
      timeLog.status = 'CLOCKED_OUT';

      await timeLog.save();
      await timeLog.populate('shiftId');

      // Update shift status
      await Shift.findByIdAndUpdate(timeLog.shiftId, { status: 'COMPLETED' });

      logger.info('User clocked out', {
        userId: req.user?.id,
        timeLogId: timeLog._id,
        totalHours: timeLog.totalHours
      });

      res.json({
        success: true,
        message: 'Clocked out successfully',
        data: { timeLog }
      });
    } catch (error: any) {
      logger.error('Clock out failed', { error: error.message });
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          success: false,
          message: error.message
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to clock out',
        error: error.message
      });
    }
  },

  // Get my time logs
  async getMyTimeLogs(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 10, startDate, endDate } = req.query;

      const filter: any = { userId: req.user?.id };
      
      if (startDate || endDate) {
        filter.clockIn = {};
        if (startDate) filter.clockIn.$gte = new Date(startDate as string);
        if (endDate) filter.clockIn.$lte = new Date(endDate as string);
      }

      const timeLogs = await TimeLog.find(filter)
        .populate('shiftId')
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .sort({ clockIn: -1 });

      const total = await TimeLog.countDocuments(filter);

      res.json({
        success: true,
        data: {
          timeLogs,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
          }
        }
      });
    } catch (error: any) {
      logger.error('Get time logs failed', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch time logs',
        error: error.message
      });
    }
  },

  // Get company time logs (managers only)
  async getCompanyTimeLogs(req: AuthRequest, res: Response) {
    try {
      const { 
        page = 1, 
        limit = 10, 
        userId, 
        startDate, 
        endDate 
      } = req.query;

      const filter: any = { companyId: req.user?.companyId };

      if (userId) {
        filter.userId = userId;
      }

      if (startDate || endDate) {
        filter.clockIn = {};
        if (startDate) filter.clockIn.$gte = new Date(startDate as string);
        if (endDate) filter.clockIn.$lte = new Date(endDate as string);
      }

      const timeLogs = await TimeLog.find(filter)
        .populate('userId', 'name email jobTitle')
        .populate('shiftId')
        .limit(Number(limit) * 1)
        .skip((Number(page) - 1) * Number(limit))
        .sort({ clockIn: -1 });

      const total = await TimeLog.countDocuments(filter);

      res.json({
        success: true,
        data: {
          timeLogs,
          pagination: {
            current: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
          }
        }
      });
    } catch (error: any) {
      logger.error('Get company time logs failed', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch time logs',
        error: error.message
      });
    }
  },

  // Get active clock-in status
  async getActiveClockIn(req: AuthRequest, res: Response) {
    try {
      const activeClockIn = await TimeLog.findOne({
        userId: req.user?.id,
        isClockedIn: true
      }).populate('shiftId');

      res.json({
        success: true,
        data: { activeClockIn }
      });
    } catch (error: any) {
      logger.error('Get active clock-in failed', { error: error.message });
      res.status(500).json({
        success: false,
        message: 'Failed to check clock-in status',
        error: error.message
      });
    }
  }
};