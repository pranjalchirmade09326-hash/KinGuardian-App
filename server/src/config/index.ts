import dotenv from 'dotenv';
import path from 'path';

// Load .env if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export interface Config {
  port: number;
  nodeEnv: string;
  databaseUrl: string;
  corsOrigin: string;
  logLevel: string;
}

export const config: Config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://kinguardian:kinguardian_secret_pw@localhost:5432/kinguardian_db',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  logLevel: process.env.LOG_LEVEL || 'info',
};
