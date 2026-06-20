/**
 * src/controllers/user.controller.ts
 * User Controller – Secure, Company-Scoped CRUD + /me Endpoint
 * ------------------------------------------------------------
 * - Uses req.user from auth middleware
 * - Enforces company boundaries
 * - Proper error handling & validation
 * - Type-safe with AuthRequest
 */

import {  Response, NextFunction } from 'express';
import { UserService } from '../services/user_services';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Types } from 'mongoose';
import { canManageRole, UserRole } from '../constant/role';
import { logger } from '../utils/logger';

export class UserController {
  // Get all users (scoped by company for non-admins)
  static async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const companyId = req.user?.companyId;

      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'User must belong to a company',
        });
      }

      const result = await UserService.getUsers(
        companyId,
        Number(page),
        Number(limit),
        req.user?.role,
      );

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  // ---------------------------------------------------------------------
  // Search unlinked users (users without a companyId)
  // ---------------------------------------------------------------------
  static async searchUnlinkedUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q) {
        return res.status(400).json({ success: false, message: 'Query is required' });
      }

      const users = await UserService.searchUnlinkedUsers(q as string);

      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  // Get current user profile (/me)
  static async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId || !Types.ObjectId.isValid(userId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
      }

      const user = await UserService.getMe(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }



/* -----------------------------------------------------------------
 * Update current user's profile (/api/users/me)
 * ----------------------------------------------------------------- */

static async updateMyProfile(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized" });
    }

    const updatedUser = await UserService.updateUser(
      currentUser.id,
      req.body,
      currentUser.id
    );

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, data: updatedUser });
  } catch (err) {
    logger.error("updateMyProfile error", {
      userId: req.user?.id,
      error: (err as Error).message,
    });
    next(err);
  }
}



  // Get user by ID (with access control)
  static async getUserById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
      }

      const user = await UserService.getUserById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Restrict access if not admin and user is from different company
      if (req.user?.role !== 'admin' && user.companyId?.toString() !== req.user?.companyId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  // Create new user (within authenticated company context)
  // Create new user (within authenticated company context)
  static async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, email, password, role } = req.body;
      const companyId = req.user?.companyId;

      // Validate required fields
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required',
        });
      }

      // Ensure user has a company context (manager/admin only)
      if (!companyId) {
        return res.status(400).json({
          success: false,
          message: 'Company context is required',
        });
      }

      // Validate and normalize role
      const validRole =
        role && ['admin', 'manager', 'employee'].includes(role.toLowerCase())
          ? role.toLowerCase()
          : 'employee';

      // Create the new user under the same company
      const newUser = await UserService.createUser({
        name,
        email,
        password,
        role: validRole,
        companyId: new Types.ObjectId(companyId), // safely convert string → ObjectId
      });

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser,
      });
    } catch (err) {
      next(err);
    }
  }

  // Update user (with access control)

static async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    if (!id || !Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const existingUser = await UserService.getUserById(id);
    if (!existingUser || !existingUser._id) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

   
    const isSelfUpdate = existingUser._id.toString() === currentUser.id;

   
    const actorRole = currentUser.role as UserRole;
    const targetRole = (existingUser.role as UserRole) || UserRole.EMPLOYEE;

    const canEdit =
      isSelfUpdate ||
      actorRole === UserRole.ADMIN || 
      (actorRole === UserRole.MANAGER && canManageRole(actorRole, targetRole)); 

    if (!canEdit) {
      return res.status(403).json({
        success: false,
        message: "Access denied. You can only edit yourself or lower roles.",
      });
    }

    const updatedUser = await UserService.updateUser(id, req.body, currentUser.id);

    return res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (err) {
    next(err);
  }
}

  // Delete user (with access control)
  static async deleteUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!id || !Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
        });
      }

      const existingUser = await UserService.getUserById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (
        req.user?.role !== 'admin' &&
        existingUser.companyId?.toString() !== req.user?.companyId
      ) {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      await UserService.deleteUser(id, req.user?.id);

      return res.status(200).json({
        success: true,
        message: 'User deleted successfully',
      });
    } catch (err) {
      next(err);
    }
  }
  // compane part

  // Add New Employee (Manager creates account)
  static async addEmployee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const manager = req.user;
      if (!manager) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (manager.role !== 'manager' && manager.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Manager access required' });
      }

      const { name, email, password, role = 'employee' } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: 'Name, email, password required' });
      }

      // Ensure manager has a company
      if (!manager.companyId) {
        return res.status(403).json({
          success: false,
          message: 'You must belong to a company to add employees',
        });
      }

      const newUser = await UserService.createUser({
        name,
        email,
        password,
        role,
        companyId: new Types.ObjectId(manager.companyId), // ← SAFE: string → ObjectId
      });

      return res.status(201).json({
        success: true,
        message: 'Employee added successfully',
        data: newUser,
      });
    } catch (err) {
      next(err);
    }
  }

  // Link Existing Employee by ID
  static async linkEmployee(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const manager = req.user;
      const { employeeId } = req.params;

      if (manager?.role !== 'manager' && manager?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Manager access required' });
      }

      const result = await UserService.linkEmployee(manager.id, employeeId);

      return res.status(200).json({
        success: true,
        message: 'Employee linked successfully',
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }
}
