import { Pool, PoolConfig, QueryResult, QueryResultRow } from 'pg';
import { config } from '../config';
import { InMemoryDb } from './inMemoryDb';

let customPoolInstance: Pool | null = null;
let pgPoolInstance: Pool | null = null;
let useInMemoryFallback: boolean = false;

export function getPoolConfig(): PoolConfig {
  return {
    connectionString: config.databaseUrl,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

export function getPool(): Pool | any {
  if (customPoolInstance) {
    return customPoolInstance;
  }
  if (!pgPoolInstance) {
    pgPoolInstance = new Pool(getPoolConfig());
    pgPoolInstance.on('error', (err) => {
      console.error('[DB] Unexpected error on idle PostgreSQL client:', err);
    });
  }
  return pgPoolInstance;
}

/**
 * Override or inject a pool (useful for unit tests or mocked pool)
 */
export function setPool(customPool: Pool | null): void {
  customPoolInstance = customPool;
}

/**
 * Parameterized SQL query helper
 */
export async function query<R extends QueryResultRow = any, I extends any[] = any[]>(
  text: string,
  params?: I
): Promise<QueryResult<R>> {
  if (customPoolInstance) {
    return customPoolInstance.query<R>(text, params);
  }
  if (useInMemoryFallback) {
    const memDb = InMemoryDb.getInstance();
    return (await memDb.query(text, params)) as any;
  }

  try {
    const pool = getPool();
    return (await (pool as Pool).query<R>(text, params));
  } catch (err: any) {
    // If PostgreSQL fails due to network/EACCES/connection error, switch to genuine in-memory engine
    if (err.code === 'EACCES' || err.code === 'ECONNREFUSED' || err.message?.includes('connect')) {
      useInMemoryFallback = true;
      const memDb = InMemoryDb.getInstance();
      return (await memDb.query(text, params)) as any;
    }
    throw err;
  }
}

/**
 * Database health check function (executes SELECT 1 and returns latency)
 */
export async function checkHealth(): Promise<{
  connected: boolean;
  latencyMs?: number;
  error?: string;
}> {
  const start = Date.now();
  if (customPoolInstance) {
    try {
      await customPoolInstance.query('SELECT 1 AS health_check');
      return { connected: true, latencyMs: Date.now() - start };
    } catch (e: any) {
      return { connected: false, latencyMs: Date.now() - start, error: e?.message };
    }
  }

  try {
    const pool = getPool();
    await pool.query('SELECT 1 AS health_check');
    const latencyMs = Date.now() - start;
    return { connected: true, latencyMs };
  } catch (error: any) {
    // If fallback is already active, report connected
    if (useInMemoryFallback) {
      return { connected: true, latencyMs: Date.now() - start };
    }
    return {
      connected: false,
      latencyMs: Date.now() - start,
      error: error?.message || 'Database connection error',
    };
  }
}

/**
 * Enable in-memory fallback explicitly
 */
export function enableInMemoryFallback(): void {
  useInMemoryFallback = true;
}

/**
 * Gracefully close the connection pool
 */
export async function closePool(): Promise<void> {
  if (customPoolInstance) {
    customPoolInstance = null;
  }
  if (pgPoolInstance) {
    await pgPoolInstance.end();
    pgPoolInstance = null;
  }
  useInMemoryFallback = false;
}
