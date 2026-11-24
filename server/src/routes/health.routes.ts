import { Router, Request, Response } from 'express';
import { checkHealth } from '../db/pool';

export const healthRouter = Router();

healthRouter.get('/health', async (_req: Request, res: Response) => {
  const dbHealth = await checkHealth();
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: dbHealth.connected ? 'connected' : 'disconnected',
    ...(dbHealth.latencyMs !== undefined ? { db_latency_ms: dbHealth.latencyMs } : {}),
  });
});

healthRouter.get('/health/ready', async (_req: Request, res: Response) => {
  const dbHealth = await checkHealth();
  if (dbHealth.connected) {
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      db_latency_ms: dbHealth.latencyMs,
    });
  } else {
    res.status(503).json({
      status: 'not_ready',
      database: 'disconnected',
      error: dbHealth.error,
    });
  }
});
