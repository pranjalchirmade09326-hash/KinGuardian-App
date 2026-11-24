import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../types';

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(statusCode: number, code: string, message: string, details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(404, 'NOT_FOUND', `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const requestId = req.id || (req.headers['x-request-id'] as string);

  // Zod Validation Error
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        request_id: requestId,
        details: err.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
          code: e.code,
        })),
      },
    };
    res.status(400).json(response);
    return;
  }

  // AppError
  if (err instanceof AppError) {
    const response: ApiResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        request_id: requestId,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // PostgreSQL Error Codes
  if (err && err.code) {
    // Unique violation
    if (err.code === '23505') {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'CONFLICT',
          message: err.detail || 'A record with this unique field already exists.',
          request_id: requestId,
        },
      };
      res.status(409).json(response);
      return;
    }

    // Foreign key violation
    if (err.code === '23503') {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'FOREIGN_KEY_VIOLATION',
          message: err.detail || 'Referenced entity does not exist.',
          request_id: requestId,
        },
      };
      res.status(400).json(response);
      return;
    }

    // Invalid input syntax (e.g. invalid UUID format)
    if (err.code === '22P02') {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Invalid input syntax for type UUID or integer.',
          request_id: requestId,
        },
      };
      res.status(400).json(response);
      return;
    }
  }

  // Unhandled / Internal Server Error
  console.error(`[Unhandled Error] [Req: ${requestId}]`, err);

  const response: ApiResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred.',
      request_id: requestId,
    },
  };
  res.status(500).json(response);
}
