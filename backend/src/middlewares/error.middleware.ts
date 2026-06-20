/** =================================================================
 *  ERROR MIDDLEWARE
 *  Centralized error handler for Express.
 *  - Logs operational and unexpected errors.
 *  - Sends safe responses in production.
 *  ================================================================= */

import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export const errorMiddleware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // ✅ Avoid duplicate sends
  if (res.headersSent) return next(err);

  const statusCode =
    err.statusCode && Number.isInteger(err.statusCode) ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";
  const isOperational = err.isOperational || false;

  // ✅ Log error details
  const logMeta = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
    userId: (req as any).user?.id || null,
  };

  if (isOperational) {
    logger.warn(`⚠️ Operational error: ${message}`, { ...logMeta });
  } else {
    logger.error("❌ Uncaught exception", {
      ...logMeta,
      error: message,
      stack: err.stack,
    });
  }

  // ✅ Detect if it's an API request
  const isApiRequest =
    req.originalUrl.startsWith("/api") ||
    req.headers.accept?.includes("application/json");

  const isProd = process.env.NODE_ENV === "production";

  // ✅ Format response
  const errorResponse = {
    success: false,
    status: statusCode,
    message: isProd && !isOperational ? "Internal Server Error" : message,
    path: req.originalUrl,
    method: req.method,
    ...(isProd ? {} : { stack: err.stack }),
  };

  // ✅ Send proper response
  if (isApiRequest) {
    return res.status(statusCode).json(errorResponse);
  } else {
    // For non-API routes, render a generic page
    return res.status(statusCode).send(message);
  }
};
