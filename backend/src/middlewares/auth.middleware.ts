/** =================================================================
 *  AUTH MIDDLEWARE (Consolidated) - FIXED VERSION
 *  --------------------------------------------------------------- */
import { Request, Response, NextFunction } from 'express';
import { JsonWebTokenError, TokenExpiredError, NotBeforeError, verify } from 'jsonwebtoken';

import {  jwt as jwtCfg } from '../config/auth.config';
import { AppError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { UserRole, getPermissionsForRole, isValidRole } from '../constant/role';
import { UserModel } from '../models/user_model';
import { DecodedToken, isBlacklisted, signToken, TokenPayload, verifyToken } from '../utils/jwt';
import { v4 as uuid } from 'uuid';
import { redisClient } from '../config';
import { Types } from 'mongoose';
import jwt from "jsonwebtoken";

/* -----------------------------------------------------------------
 *  EXTEND Express Request – make `req.user` known to TS
 * ----------------------------------------------------------------- */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        permissions: string[];
        companyId: string | null;   
      };
    }
  }
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
    permissions: string[];
    companyId: string | null;   
  };
}

/* -----------------------------------------------------------------
 *  requireAuth – main authentication middleware 
 * ----------------------------------------------------------------- */
const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1. Get token from cookie ONLY
    const token = req.cookies?.accessToken;

    if (!token) {
      return next(new AppError('Authorization header missing or malformed', 401));
    }

    // 2. Check blacklist
    if (isBlacklisted(token)) {
      return next(new AppError('Token revoked', 401));
    }

    // 3. Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!, {
        algorithms: ['HS256'],
      }) as { userId: string; role: string; companyId?: string };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return handleTokenRefresh(req, res, next);
      }
      return handleJWTError(err, req, next);
    }

    // 4. Find user
    const user = await UserModel.findById(decoded.userId).select('+refreshToken');
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    // 5. Attach user
    req.user = {
      id: user._id.toString(),
      role: user.role,
      permissions: user.permissions ?? [],
      companyId: user.companyId?.toString() ?? null,
    };

    next();
  } catch (err) {
    handleJWTError(err, req, next);
  }
};

/* -----------------------------------------------------------------
 *  Helper – after a *valid* token (fresh or refreshed) - FIXED
 * ----------------------------------------------------------------- */
const attachUserAndContinue = async (
  req: AuthRequest,
  decoded: DecodedToken,
  next: NextFunction,
): Promise<void> => {
  try {
    // ---- basic claim sanity  -----------------
    const userId = (decoded as any).userId || (decoded as any).id;
    const jti = decoded.jti || (decoded as any).jti;
    const tokenType = decoded.type || (decoded as any).type;

    if (!userId) {
      return next(new AppError('Invalid token: missing user identifier (userId or id)', 401));
    }

    if (tokenType && tokenType !== 'access') {
      return next(new AppError('Invalid token type: must be access', 401));
    }

    if (decoded.role && !isValidRole(decoded.role)) {
      return next(new AppError('Invalid role in token', 401));
    }

    if (redisClient && jti) {
      const [blacklisted, session] = await redisClient.mget(`bl_${jti}`, `sess_${jti}`);
      if (blacklisted || !session) {
        return next(new AppError(blacklisted ? 'Token revoked' : 'Session expired', 401));
      }
    }

    // ---- build req.user --------------------------------------------------
    const role = isValidRole(decoded.role) ? decoded.role : UserRole.EMPLOYEE;
    const permissions = getPermissionsForRole(role);

    const user = await UserModel.findById(new Types.ObjectId(userId)).select('companyId');
    if (!user) {
      return next(new AppError('User not found', 401));
    }

    req.user = {
      id: userId,
      role,
      permissions: [...permissions],
      companyId: user.companyId?.toString() ?? null, // ← SAFE
    };

    logger.debug('User authenticated', {
      userId,
      role,
      companyId: user.companyId,
      jti: jti || 'none',
      method: req.method,
      url: req.url,
    });

    next();
  } catch (error) {
    logger.error('Error in attachUserAndContinue', { error: (error as Error).message });
    next(new AppError('Authentication failed', 500));
  }
};
/* -----------------------------------------------------------------
 * handleTokenRefresh – called only when access token is expired - FIXED
 * ----------------------------------------------------------------- */
const handleTokenRefresh = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.[jwtCfg.cookieName] ?? req.headers['x-refresh-token'];

    if (!refreshToken) {
      return next(new AppError('Access token expired & no refresh token provided', 401));
    }

    let decodedRefresh: DecodedToken;
    try {
      decodedRefresh = verifyToken(refreshToken as string, 'refresh');
    } catch (err) {
      return handleJWTError(err, req, next, 'Invalid refresh token');
    }

    // ✅ Redis client check
    if (!redisClient) {
      return next(new AppError('Redis client not available', 500));
    }

    // ---- Extract userId safely (support both 'id' and 'userId') ----
    const userId = (decodedRefresh as any).userId || (decodedRefresh as any).id;
    if (!userId) {
      return next(new AppError('Invalid refresh token: missing user identifier', 401));
    }

    // ---- Rate-limit refreshes (10-min window, max 5) ----
    const rateKey = `rate_refresh_${userId}`;
    const attempts = await redisClient.incr(rateKey);
    if (attempts === 1) await redisClient.expire(rateKey, 600);
    if (attempts > 5) {
      return next(new AppError('Too many refresh attempts', 429));
    }

    // ---- Blacklist / session check ----
    const jti = (decodedRefresh as any).jti;
    if (jti) {
      const [blacklisted, session] = await redisClient.mget(`bl_${jti}`, `sess_${jti}`);
      if (blacklisted || !session) {
        return next(new AppError('Refresh token revoked or expired', 401));
      }
    }

    // ---- Revoke old JTI (if exists) ----
    if (jti) {
      await redisClient.setex(`bl_${jti}`, 3600, '1');
    }

    // ---- Issue brand-new tokens ----
    const newJti = uuid();
    const payload: TokenPayload = {
      userId: userId,
      role: decodedRefresh.role,
      type: 'access',
      jti: newJti,
    };

    const newAccess = signToken(payload, 'access');
    const newRefresh = signToken({ ...payload, type: 'refresh' }, 'refresh');
    const decodedNew = verifyToken(newAccess, 'access');

    // ---- Store new session ----
    await redisClient.setex(`sess_${newJti}`, decodedNew.exp! - decodedNew.iat!, userId);

    // ---- Send refresh token back (cookie or header) ----
    if (req.cookies?.[jwtCfg.cookieName]) {
      res.cookie(jwtCfg.cookieName, newRefresh, jwtCfg.cookieOptions);
    }
    res.setHeader('x-access-token', newAccess);

    // ---- Audit log ----
    await redisClient.setex(
      `audit_${newJti}`,
      24 * 60 * 60,
      JSON.stringify({
        event: 'REFRESH',
        userId,
        time: Date.now(),
      }),
    );

    // ---- Attach user using new token ----
    await attachUserAndContinue(req, { ...decodedRefresh, userId, jti: newJti }, next);
  } catch (error) {
    logger.error('Error in handleTokenRefresh', { error: (error as Error).message });
    next(new AppError('Token refresh failed', 500));
  }
};
/* -----------------------------------------------------------------
 *  handleJWTError – centralised error → AppError + logging - FIXED
 * ----------------------------------------------------------------- */
const handleJWTError = (
  err: unknown,
  req: Request,
  next: NextFunction,
  customMsg?: string,
): void => {
  let message = customMsg ?? 'Invalid token';
  let status = 401;

  if (err instanceof TokenExpiredError) {
    message = 'Token has expired';
  } else if (err instanceof NotBeforeError) {
    message = 'Token not yet valid';
  } else if (err instanceof JsonWebTokenError) {
    message = 'Malformed JWT';
  } else {
    status = 500;
    message = 'Authentication error';
  }

  logger.warn('JWT verification failed', {
    message,
    method: req.method,
    url: req.url,
    ip: req.ip,
    ua: req.get('User-Agent'),
    err: (err as Error)?.message,
  });

  next(new AppError(message, status));
};

/* -----------------------------------------------------------------
 *  SIMPLIFIED RBAC MIDDLEWARE - For your use case
 * ----------------------------------------------------------------- */

/**
 * Middleware to require specific role
 */
//  const requireRole = (requiredRole: UserRole) => {
//   return (req: AuthRequest, res: Response, next: NextFunction) => {
//     if (!req.user) {
//       return next(new AppError('Authentication required', 401));
//     }

//     if (req.user.role !== requiredRole) {
//       return next(new AppError(`Access denied. ${requiredRole} role required.`, 403));
//     }

//     next();
//   };
// };

const requireRole = (requiredRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !requiredRoles.includes(req.user.role)) {
      return next(new AppError(`Requires one of: ${requiredRoles.join(', ')}`, 403));
    }
    next();
  };
};

/**
 * Middleware to require manager or admin role
 */
const requireManagerOrAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== UserRole.MANAGER && req.user.role !== UserRole.ADMIN) {
    return next(new AppError('Access denied. Manager or Admin role required.', 403));
  }

  next();
};

/**
 * Middleware to check if user can access company resources
 */
const canAccessCompanyResource = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // Admin can access all resources
  if (req.user.role === UserRole.ADMIN) {
    return next();
  }

  // For managers and employees, check if they're accessing their own company data
  const resourceCompanyId = req.params.companyId || req.body.companyId;

  if (resourceCompanyId && resourceCompanyId !== req.user.companyId) {
    return next(new AppError('Access denied to company resources', 403));
  }

  next();
};

/**
 * Middleware to check if user can manage other users
 */
const canManageUsers = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  // Only managers and admins can manage users
  if (req.user.role !== UserRole.MANAGER && req.user.role !== UserRole.ADMIN) {
    return next(
      new AppError('Access denied. User management requires Manager or Admin role.', 403),
    );
  }

  next();
};

const requireManager = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next(new AppError('Authentication required', 401));
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return next(new AppError('Manager access required', 403));
  }
  next();
};

/**
 * for enshue employee belongs to one company
 */
/**
 * Ensures the target employee belongs to the same company as the current user
 * - Admins bypass this check
 * - Uses req.user.companyId (string | undefined)
 * - Compares companyId safely
 */
const requireSameCompany = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const targetUserId =
      (req.params as any).employeeId ||
      (req.params as any).id ||
      req.body.employeeId ||
      req.body.userId;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'Target user ID is required' });
    }

    // Admin bypass
    if (currentUser.role === UserRole.ADMIN) {
      return next();
    }

    // Current user must have company
    if (!currentUser.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not assigned to a company',
      });
    }

    const targetUser = await UserModel.findById(targetUserId).select('companyId');
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!targetUser.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Target user is not in a company',
      });
    }

    if (targetUser.companyId.toString() !== currentUser.companyId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: User belongs to a different company',
      });
    }

    next(); // ← no return
  } catch (err) {
    next(err);
  }
};

/* -----------------------------------------------------------------
 *  EXPORTS
 * ----------------------------------------------------------------- */

export {
  requireAuth,
  requireRole,
  requireManagerOrAdmin,
  canAccessCompanyResource,
  canManageUsers,
  handleTokenRefresh,
  handleJWTError,
  requireSameCompany,
  requireManager,
};

export type { AuthRequest };

// // ==================================================================
// // Role-Based Access Control (RBAC) Middleware
// // ==================================================================
// export const requireRole = (requiredRoles: UserRole[]) => {
//   return (req: AuthRequest, _res: Response, next: NextFunction): void => {
//     if (!req.user || !requiredRoles.includes(req.user.role)) {
//       return next(new AppError(`Requires one of: ${requiredRoles.join(', ')}`, 403));
//     }
//     next();
//   };
// };

// export const requireManagerOrAdmin = (
//   req: AuthRequest,
//   _res: Response,
//   next: NextFunction
// ): void => {
//   if (!req.user || ![UserRole.MANAGER, UserRole.ADMIN].includes(req.user.role)) {
//     return next(new AppError('Requires Manager or Admin role', 403));
//   }
//   next();
// };

// export const canAccessCompany = (
//   req: AuthRequest,
//   _res: Response,
//   next: NextFunction
// ): void => {
//   if (!req.user) {
//     return next(new AppError('Unauthorized', 401));
//   }

//   // Admins can access any company
//   if (req.user.role === UserRole.ADMIN) return next();

//   const targetCompanyId = req.params.companyId || req.body.companyId;
//   if (targetCompanyId && targetCompanyId !== req.user.companyId) {
//     return next(new AppError('You do not have permission to access this company', 403));
//   }

//   next();
// };

// // ==================================================================
// // Exports
// // ==================================================================
// export {
//   handleTokenRefresh,
//   handleJWTError,
// };

// export type { AuthRequest };
