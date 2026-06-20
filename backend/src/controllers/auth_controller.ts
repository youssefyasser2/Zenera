 /**
 * src/controllers/auth_controller.ts
 * Auth Controller – Register, Login, Refresh, Logout, Delete Account
 * -------------------------------------------------------------------
 * - Uses Zod validation
 * - Secure cookie for refresh token
 * - Clean responses (no password, no refreshToken)
 * - Proper error handling with AppError & ZodError
 * - Type-safe with AuthRequest
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth_services';
import { AppError } from '../errors/AppError';
import { AuthRequest } from '../middlewares/auth.middleware';
import { registerSchema, loginSchema } from '../validation/validate_middleware';
import {  z } from 'zod';
import { addToBlacklist } from '../utils/jwt';
import { decode } from 'jsonwebtoken';

const authService = new AuthService();

/**
 * POST /api/auth/register
 *
 * - Employees: { name, email, password } → companyId = null
 * - Managers: { name, email, password, companyName } → creates company
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Parse & validate input
    const parsed = registerSchema.parse(req.body);
    const { name, email, password, companyName } = parsed;

    // 2. Determine registration type
    const isManagerRegistration = !!companyName;
    const role = isManagerRegistration ? 'manager' : 'employee';

    // 3. Call service (companyName optional)
    const user = await authService.register(
      name,
      email,
      password,
      role,
      companyName ?? undefined
    );

    // 4. Success message based on type
    const message = isManagerRegistration
      ? 'Company and manager account created successfully.'
      : 'Employee account created successfully. You can now be invited to a company.';

    // 5. Return cleaner response
    return res.status(201).json({
      success: true,
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: isManagerRegistration
          ? companyName
          : user.companyId
          ? user.companyId
          : 'Not assigned yet',
      },
    });
  } catch (error) {
    // ——— ERROR HANDLING (unchanged) ———
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const { user, accessToken, refreshToken } = await authService.login(email, password);

   // Set BOTH cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    })
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: { user, accessToken }, 
    });

    // user is already clean → no need to destructure
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, accessToken },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/auth/refresh-token
 */
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) throw new AppError('Refresh token required', 401);

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    return res.status(200).json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Token refresh failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const accessToken = req.headers.authorization?.split(' ')[1];

    if (!userId) throw new AppError('User not authenticated', 401);

    
    await authService.logout(userId);

    
    if (accessToken) {
      const decoded = decode(accessToken) as any;
      if (decoded?.exp) {
        const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
        if (expiresIn > 0) {
          addToBlacklist(accessToken, expiresIn);
        }
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * DELETE /api/auth/delete-account
 */
export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError('User not authenticated', 401);

    await authService.deleteAccount(userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      message: 'Account deleted permanently',
    });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Account deletion failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

