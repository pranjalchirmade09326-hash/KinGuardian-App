import http from 'http';
import { app } from './app';
import { config } from './config';
import { checkHealth, closePool } from './db/pool';

const server = http.createServer(app);
let pipeServer: http.Server | null = null;
const pipePath = process.env.PIPE_PATH || (process.platform === 'win32' ? '\\\\.\\pipe\\kinguardian-server' : '/tmp/kinguardian.sock');

async function startServer(): Promise<void> {
  // Test DB connection on startup (non-fatal, reports status)
  try {
    const health = await checkHealth();
    if (health.connected) {
      console.log(`[DB] Database ready (${health.latencyMs}ms)`);
    } else {
      console.warn(`[DB] Warning: PostgreSQL not immediately reachable: ${health.error}`);
    }
  } catch (err: any) {
    console.warn(`[DB] Warning: Could not connect to PostgreSQL: ${err?.message}`);
  }

  // Start Windows named pipe IPC server for local sandbox interoperability
  if (process.platform === 'win32') {
    try {
      pipeServer = http.createServer(app);
      pipeServer.listen(pipePath, () => {
        console.log(`[IPC] Named pipe listener active on ${pipePath}`);
      });
      pipeServer.on('error', (err) => {
        console.warn(`[IPC] Named pipe warning: ${err.message}`);
      });
    } catch (e: any) {
      console.warn(`[IPC] Pipe setup warning: ${e.message}`);
    }
  }

  server.listen(config.port, () => {
    console.log(`====================================================`);
    console.log(`KinGuardian Backend Service running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Health endpoint: http://localhost:${config.port}/health`);
    console.log(`API v1 root: http://localhost:${config.port}/api/v1`);
    console.log(`====================================================`);
  });
}

// Graceful shutdown handling
async function gracefulShutdown(signal: string): Promise<void> {
  console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
  if (pipeServer) {
    try {
      pipeServer.close();
    } catch {}
  }
  server.close(async () => {
    console.log('[Server] HTTP listener closed.');
    try {
      await closePool();
      console.log('[DB] Database connection pool closed.');
    } catch (e) {
      console.error('[DB] Error closing pool:', e);
    }
    process.exit(0);
  });

  // Force close after 10s timeout
  setTimeout(() => {
    console.error('[Server] Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

if (require.main === module) {
  startServer().catch((err) => {
    console.error('[Server] Fatal startup error:', err);
    process.exit(1);
  });
}

export { server, startServer };
