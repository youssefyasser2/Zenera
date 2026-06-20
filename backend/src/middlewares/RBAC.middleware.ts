/**
 * =================================================================
 * RBAC MIDDLEWARE (Comprehensive Role-Based Access Control)
 * =================================================================
 * - Single source of truth for all authorization logic
 * - Dynamic permission checks with pre-built convenience methods
 * - Auto-generated middleware for all permissions
 * - Comprehensive logging and error handling
 * - Flexible role hierarchy and permission management
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import {
  UserRole,
  hasPermission,
  canManageRole,
  Permission,
  RolePermissions,
} from '../constant/role';
import { logger } from '../utils/logger';
import { AuthRequest } from './auth.middleware';

/* -----------------------------------------------------------------
 *  CORE FACTORIES
 * ----------------------------------------------------------------- */

/**
 * Require specific role
 */
const requireRole = (requiredRole: UserRole, msg?: string) => {
  const message = msg || `Access denied: ${requiredRole} role required`;
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return unauth(next, 'No user session');
    if (user.role !== requiredRole) return forbidden(next, message, { requiredRole, userRole: user.role });
    next();
  };
};

/**
 * Require minimum role in hierarchy
 */
const requireMinRole = (minRole: UserRole, msg?: string) => {
  const message = msg || `Access denied: Requires ${minRole} or higher`;
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return unauth(next);
    if (!canManageRole(user.role, minRole)) return forbidden(next, message, { minRole, userRole: user.role });
    next();
  };
};

/**
 * Require specific permission
 */
const requirePermission = (permission: Permission, msg?: string) => {
  const message = msg || `Missing permission: ${permission}`;
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) return unauth(next);
    if (!hasPermission(user.role, permission)) return forbidden(next, message, { permission, userRole: user.role });
    next();
  };
};

/* -----------------------------------------------------------------
 *  HELPER FUNCTIONS (DRY)
 * ----------------------------------------------------------------- */

/**
 * Handle unauthorized access
 */
const unauth = (next: NextFunction, msg = 'Authentication required') => {
  logger.warn('Access denied: Unauthorized', {
    message: msg,
  });
  return next(new AppError(msg, 401));
};

/**
 * Handle forbidden access with detailed logging
 */
const forbidden = (next: NextFunction, msg: string, meta: Record<string, any> = {}) => {
  logger.warn('Access denied: Forbidden', {
    message: msg,
    ...meta,
  });
  return next(new AppError(msg, 403));
};

/* -----------------------------------------------------------------
 *  DYNAMIC PERMISSION MIDDLEWARE
 * ----------------------------------------------------------------- */

/**
 * Dynamic permission checker - main export for route definitions
 */
export const permit = (permission: Permission, msg?: string) => requirePermission(permission, msg);

/* -----------------------------------------------------------------
 *  PRE-BUILT ROLE MIDDLEWARES (Convenience methods)
 * ----------------------------------------------------------------- */

// Specific role checkers
export const isAdmin = requireRole(UserRole.ADMIN);
export const isManager = requireRole(UserRole.MANAGER);
export const isEmployee = requireRole(UserRole.EMPLOYEE);

// Minimum role checkers
export const isManagerOrHigher = requireMinRole(UserRole.MANAGER);
export const isEmployeeOrHigher = requireMinRole(UserRole.EMPLOYEE);

// Role group checkers
export const isManagerOrAdmin = requireMinRole(UserRole.MANAGER);
export const isAdminOnly = requireRole(UserRole.ADMIN);

/* -----------------------------------------------------------------
 *  AUTO-GENERATED PERMISSION MIDDLEWARES
 *  Generates middleware for every permission in the system
 *  Usage: can.createUsers, can.manageShifts, etc.
 * ----------------------------------------------------------------- */

// Get all unique permissions from the role system
const allPermissions = new Set<Permission>();
Object.values(RolePermissions).forEach(perms => perms.forEach(p => allPermissions.add(p)));

// Create the 'can' object with middleware for every permission
export const can: Record<Permission, ReturnType<typeof requirePermission>> = {} as any;

allPermissions.forEach(perm => {
  can[perm] = requirePermission(perm);
});

/* -----------------------------------------------------------------
 *  ENHANCED BUSINESS LOGIC MIDDLEWARES
 *  Common authorization patterns for specific business operations
 * ----------------------------------------------------------------- */

/**
 * Check if user can create users (Manager+ or specific permission)
 */
export const canCreateUsers = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const user = req.user!;
  
  // Admin and Manager can always create users
  if ([UserRole.ADMIN, UserRole.MANAGER].includes(user.role)) {
    return next();
  }
  
  // Check for specific permission
  if (hasPermission(user.role, 'users:create' as Permission)) {
    return next();
  }
  
  return forbidden(next, 'Insufficient privileges to create users', {
    userRole: user.role,
    required: ['ADMIN', 'MANAGER', 'users:create']
  });
};

/**
 * Check if user can manage users (Manager+ or specific permission)
 */
export const canManageUsers = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const user = req.user!;
  
  // Admin and Manager can always manage users
  if ([UserRole.ADMIN, UserRole.MANAGER].includes(user.role)) {
    return next();
  }
  
  // Check for specific permission
  if (hasPermission(user.role, 'users:manage' as Permission)) {
    return next();
  }
  
  return forbidden(next, 'Insufficient privileges to manage users', {
    userRole: user.role,
    required: ['ADMIN', 'MANAGER', 'users:manage']
  });
};

/**
 * Check if user can assign roles (Admin only or specific permission)
 */
export const canAssignRoles = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const user = req.user!;
  
  // Admin can always assign roles
  if (user.role === UserRole.ADMIN) {
    return next();
  }
  
  // Check for specific permission
  if (hasPermission(user.role, 'roles:assign' as Permission)) {
    return next();
  }
  
  return forbidden(next, 'Only Admins can assign roles', {
    userRole: user.role,
    required: ['ADMIN', 'roles:assign']
  });
};

/**
 * Check if user can manage shifts (Manager+ or specific permission)
 */
export const canManageShifts = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const user = req.user!;
  
  // Admin and Manager can always manage shifts
  if ([UserRole.ADMIN, UserRole.MANAGER].includes(user.role)) {
    return next();
  }
  
  // Check for specific permissions
  if (
    hasPermission(user.role, 'shifts:create' as Permission) ||
    hasPermission(user.role, 'shifts:update' as Permission) ||
    hasPermission(user.role, 'shifts:delete' as Permission)
  ) {
    return next();
  }
  
  return forbidden(next, 'Insufficient privileges to manage shifts', {
    userRole: user.role,
    required: ['ADMIN', 'MANAGER', 'shifts permissions']
  });
};

/**
 * Check if user can view company-wide data (Manager+)
 */
export const canViewCompanyData = (req: AuthRequest, _res: Response, next: NextFunction) => {
  const user = req.user!;
  
  if ([UserRole.ADMIN, UserRole.MANAGER].includes(user.role)) {
    return next();
  }
  
  return forbidden(next, 'Insufficient privileges to view company data', {
    userRole: user.role,
    required: ['ADMIN', 'MANAGER']
  });
};

/**
 * Check if user can manage their own resources
 * Useful for employees managing their own profile, shifts, etc.
 */
export const canManageOwnResources = (resourceOwnerId: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    const user = req.user!;
    
    // Admin can manage any resources
    if (user.role === UserRole.ADMIN) {
      return next();
    }
    
    // Users can always manage their own resources
if (user.id?.toString() === resourceOwnerId) {
        return next();
    }
    
    // Managers can manage resources in their company
    if (user.role === UserRole.MANAGER) {
      // Additional company check would go here if needed
      return next();
    }
    
    return forbidden(next, 'Cannot manage resources belonging to other users', {
      userRole: user.role,
      userId: user.id,
      resourceOwnerId
    });
  };
};

/* -----------------------------------------------------------------
 *  COMPOSITE MIDDLEWARE FOR COMMON SCENARIOS
 * ----------------------------------------------------------------- */

/**
 * Combined middleware for user management operations
 */
export const requireUserManagement = [
  requireMinRole(UserRole.MANAGER),
  canManageUsers
];

/**
 * Combined middleware for shift management operations
 */
export const requireShiftManagement = [
  requireMinRole(UserRole.MANAGER),
  canManageShifts
];

/**
 * Combined middleware for admin-only operations
 */
export const requireAdminOperations = [
  requireRole(UserRole.ADMIN),
  canAssignRoles
];

/* -----------------------------------------------------------------
 *  UTILITY FUNCTIONS FOR PROGRAMMATIC USE
 * ----------------------------------------------------------------- */

/**
 * Check permissions programmatically (for use in services/controllers)
 */
export const checkPermission = (userRole: UserRole, permission: Permission): boolean => {
  return hasPermission(userRole, permission);
};

/**
 * Check role hierarchy programmatically
 */
export const checkMinRole = (userRole: UserRole, minRole: UserRole): boolean => {
  return canManageRole(userRole, minRole);
};

/**
 * Get user permissions for frontend or other services
 */
export const getUserPermissions = (userRole: UserRole): Permission[] => {
  return [...RolePermissions[userRole]];
};

/* -----------------------------------------------------------------
 *  EXPORTS
 * ----------------------------------------------------------------- */

// Core factories for dynamic use
export { requireRole, requireMinRole, requirePermission };

// Type exports for better TypeScript support
export type { Permission, UserRole };