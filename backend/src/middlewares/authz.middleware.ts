// src/middlewares/authz.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';

/**
 * Middleware factory: Ensures the authenticated user has a specific permission.
 * - Uses permissions from req.user.permissions (assigned in requireAuth).
 * - Requires exact permission match (case-sensitive).
 * - Logs access attempts for auditing and debugging.
 * 
 * @param permission - Required permission (e.g., 'manageUsers', 'viewAllReports')
 * @returns Middleware function
 * 
 * @example
 * router.get('/users', requireAuth, authorize('manageUsers'), UserController.getAllUsers);
 */
export const authorize = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      logger.warn('Authorization failed: No authenticated user', { url: req.url, ip: req.ip });
      return next(new AppError('Unauthorized: No user session', 401));
    }

    
    const permissions = user.permissions;

    if (!Array.isArray(permissions)) {
      logger.warn('Permission check failed: permissions not available', {
        userId: user.id,
        role: user.role,
        url: req.url,
      });
      return next(new AppError('Access denied: Permissions not available', 403));
    }

    
    const hasPermission = permissions.includes(permission);

    if (!hasPermission) {
      logger.warn('Permission denied', {
        userId: user.id,
        role: user.role,
        required: permission,
        available: permissions,
        url: req.url,
      });

      return next(new AppError(`Access denied: '${permission}' permission required`, 403));
    }

    logger.debug('Permission granted', { userId: user.id, permission, url: req.url });
    next();
  };
};