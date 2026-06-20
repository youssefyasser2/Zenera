// src/middlewares/validate.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { logger } from '../utils/logger';

/**
 * Validates request body using a Zod schema.
 * Use for POST/PUT requests with JSON body.
 */
export const validateBody = <T extends ZodSchema<any>>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map(issue => ({
          field: issue.path.join('.') || 'body',
          message: issue.message,
          code: issue.code,
        }));

        logger.warn('Validation failed (body)', {
          errors,
          url: req.url,
          method: req.method,
          ip: req.ip,
        });

        return res.status(400).json({
          status: 'fail',
          message: 'Validation failed',
          errors,
        });
      }
      next(error);
    }
  };
};

/**
 * Validates URL parameters (e.g., :id).
 */
export const validateParams = <T extends ZodSchema<any>>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.params = schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid URL parameters',
          errors: error.issues.map(issue => ({
            field: issue.path.join('.') || 'params',
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
};

/**
 * Validates query parameters (e.g., ?page=1&limit=10).
 */
export const validateQuery = <T extends ZodSchema<any>>(schema: T) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          status: 'fail',
          message: 'Invalid query parameters',
          errors: error.issues.map(issue => ({
            field: issue.path.join('.') || 'query',
            message: issue.message,
          })),
        });
      }
      next(error);
    }
  };
};