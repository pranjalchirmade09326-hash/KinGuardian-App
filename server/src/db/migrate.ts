import fs from 'fs';
import path from 'path';
import { getPool, closePool } from './pool';

export async function runMigrations(): Promise<string[]> {
  const pool = getPool();
  const client = await pool.connect();

  const appliedMigrations: string[] = [];

  try {
    await client.query('BEGIN');

    // Ensure migrations table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Look for migrations in both src and dist locations
    const possibleDirs = [
      path.resolve(__dirname, 'migrations'),
      path.resolve(__dirname, '../../src/db/migrations'),
      path.resolve(__dirname, '../db/migrations'),
    ];

    let migrationsDir = possibleDirs.find((dir) => fs.existsSync(dir));
    if (!migrationsDir) {
      console.warn('[Migrate] No migrations directory found. Skipping migrations.');
      await client.query('COMMIT');
      return [];
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    const existingRes = await client.query(
      'SELECT name FROM schema_migrations'
    );
    const existing = new Set(existingRes.rows.map((row: any) => row.name));

    for (const file of files) {
      if (!existing.has(file)) {
        console.log(`[Migrate] Applying migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (name) VALUES ($1)',
          [file]
        );
        appliedMigrations.push(file);
      }
    }

    await client.query('COMMIT');
    console.log(`[Migrate] Migrations completed. Applied ${appliedMigrations.length} new migrations.`);
    return appliedMigrations;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Migrate] Error executing migrations:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Execute directly if run as CLI script
if (require.main === module) {
  runMigrations()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[Migrate] Migration failed:', err);
      await closePool();
      process.exit(1);
    });
}
