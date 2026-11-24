import express, { Express } from 'express';
import { correlationIdMiddleware, requestLogger } from './middleware/logger';
import { corsMiddleware } from './middleware/cors';
import { healthRouter } from './routes/health.routes';
import { apiV1Router } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  // Middleware pipeline
  app.use(correlationIdMiddleware);
  app.use(requestLogger);
  app.use(corsMiddleware);
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Root health endpoints
  app.use('/', healthRouter);

  // API v1 endpoints
  app.use('/api/v1', apiV1Router);

  // 404 handler for undefined routes
  app.use(notFoundHandler);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}

export const app = createApp();
export default app;
