/**
 * Error Handler Middleware
 * Centralized error handling for Express
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { DatabaseError, NotFoundError, ValidationError } from '@auraos/database';

export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: any;
  stack?: string;
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', error);

  if (error instanceof ZodError) {
    res.status(400).json({
      status: 400,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      })),
    });
    return;
  }

  if (error instanceof ValidationError) {
    res.status(400).json({
      status: 400,
      message: error.message,
      code: error.code || 'VALIDATION_ERROR',
      details: error.details,
    });
    return;
  }

  if (error instanceof NotFoundError) {
    res.status(404).json({
      status: 404,
      message: error.message,
      code: error.code || 'NOT_FOUND',
    });
    return;
  }

  if (error instanceof DatabaseError) {
    res.status(500).json({
      status: 500,
      message: 'Database error occurred',
      code: error.code || 'DATABASE_ERROR',
      ...(process.env.NODE_ENV === 'development' && { details: error.message }),
    });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.status).json({
      status: error.status,
      message: error.message,
      code: error.code,
      details: error.details,
    });
    return;
  }

  res.status(500).json({
    status: 500,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    status: 404,
    message: `Route ${req.method} ${req.path} not found`,
    code: 'ROUTE_NOT_FOUND',
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
