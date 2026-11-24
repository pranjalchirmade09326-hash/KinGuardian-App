import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';

// Augment Express Request interface to include id
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }
  }
}

/**
 * Middleware ensuring every request has a correlation ID (X-Request-ID)
 */
export function correlationIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const reqId = (req.headers['x-request-id'] as string) || uuidv4();
  req.id = reqId;
  res.setHeader('X-Request-ID', reqId);
  next();
}

// Define custom morgan token for request ID
morgan.token('req-id', (req: Request) => req.id || '-');

export const requestLogger = morgan(
  config.nodeEnv === 'production'
    ? '[:date[iso]] :req-id :method :url :status :response-time ms - :res[content-length]'
    : '[:req-id] :method :url :status :response-time ms'
);
