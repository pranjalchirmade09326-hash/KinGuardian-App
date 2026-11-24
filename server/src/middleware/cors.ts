import cors from 'cors';
import { config } from '../config';

export const corsMiddleware = cors({
  origin: config.corsOrigin === '*' ? true : config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  exposedHeaders: ['X-Request-ID'],
  credentials: true,
});
