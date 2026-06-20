/** =================================================================
 *  APP ERROR
 *  Custom error class for operational errors.
 *  Used across the application for consistent error handling.
 *  ================================================================= */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean = true;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}