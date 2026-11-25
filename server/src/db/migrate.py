"""PostgreSQL SQL migration runner."""

from __future__ import annotations

import asyncio
import sys
from pathlib import Path

import psycopg
from psycopg.rows import dict_row

from src.config import config


async def run_migrations() -> list[str]:
    """Apply pending .sql migrations from src/db/migrations in order."""
    applied_migrations: list[str] = []
    migrations_dir = Path(__file__).resolve().parent / "migrations"

    if not migrations_dir.exists():
        print("[Migrate] No migrations directory found. Skipping migrations.")
        return []

    files = sorted(f for f in migrations_dir.iterdir() if f.suffix == ".sql")

    async with await psycopg.AsyncConnection.connect(
        config.database_url, row_factory=dict_row
    ) as conn:
        async with conn.transaction():
            await conn.execute(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
                """
            )

            cur = await conn.execute("SELECT name FROM schema_migrations")
            existing = {row["name"] for row in await cur.fetchall()}

            for file_path in files:
                if file_path.name not in existing:
                    print(f"[Migrate] Applying migration: {file_path.name}")
                    sql = file_path.read_text(encoding="utf-8")
                    await conn.execute(sql)
                    await conn.execute(
                        "INSERT INTO schema_migrations (name) VALUES (%s)",
                        [file_path.name],
                    )
                    applied_migrations.append(file_path.name)

    print(
        f"[Migrate] Migrations completed. Applied {len(applied_migrations)} new migrations."
    )
    return applied_migrations


if __name__ == "__main__":
    try:
        asyncio.run(run_migrations())
        sys.exit(0)
    except Exception as exc:
        print(f"[Migrate] Migration failed: {exc}", file=sys.stderr)
        sys.exit(1)
