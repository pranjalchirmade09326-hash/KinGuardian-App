"""PostgreSQL async connection pool with automatic in-memory fallback."""

from __future__ import annotations

import logging
import time
from typing import Any, Optional

from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool

from src.config import config
from src.db.in_memory_db import InMemoryDb, QueryResult

logger = logging.getLogger("kinguardian.db")

_custom_pool: Any = None
_pg_pool: Optional[AsyncConnectionPool] = None
_use_in_memory_fallback: bool = False


async def get_pool() -> Any:
    global _pg_pool
    if _custom_pool is not None:
        return _custom_pool
    if _pg_pool is None:
        _pg_pool = AsyncConnectionPool(
            conninfo=config.database_url,
            min_size=1,
            max_size=20,
            timeout=2.0,
            open=False,
            kwargs={"row_factory": dict_row},
        )
        await _pg_pool.open(wait=True, timeout=2.0)
    return _pg_pool


def set_pool(custom_pool: Any) -> None:
    """Override or inject a custom pool (useful for unit tests)."""
    global _custom_pool
    _custom_pool = custom_pool


def enable_in_memory_fallback() -> None:
    """Enable the in-memory database fallback explicitly."""
    global _use_in_memory_fallback
    _use_in_memory_fallback = True


async def query(text: str, params: Optional[list[Any]] = None) -> QueryResult:
    """Execute a parameterized SQL query against PostgreSQL or the in-memory fallback."""
    global _use_in_memory_fallback

    if _custom_pool is not None:
        return await _custom_pool.query(text, params)

    if _use_in_memory_fallback:
        return await InMemoryDb.get_instance().query(text, params)

    try:
        pool = await get_pool()
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute(text, params or [])
                rows = await cur.fetchall() if cur.description else []
                return QueryResult(rows=list(rows), row_count=cur.rowcount or len(rows))
    except Exception as exc:
        err_msg = str(exc).lower()
        if any(
            token in err_msg
            for token in ("connection", "timeout", "refused", "could not connect", "network", "eacces")
        ) or isinstance(exc, OSError):
            logger.warning("PostgreSQL unreachable (%s); switching to in-memory fallback.", exc)
            _use_in_memory_fallback = True
            return await InMemoryDb.get_instance().query(text, params)
        raise


async def check_health() -> dict[str, Any]:
    """Check database connectivity and return latency in milliseconds."""
    start = time.perf_counter()

    if _custom_pool is not None:
        try:
            await _custom_pool.query("SELECT 1 AS health_check")
            return {
                "connected": True,
                "latency_ms": round((time.perf_counter() - start) * 1000, 2),
            }
        except Exception as exc:
            return {
                "connected": False,
                "latency_ms": round((time.perf_counter() - start) * 1000, 2),
                "error": str(exc),
            }

    if _use_in_memory_fallback:
        return {
            "connected": True,
            "latency_ms": round((time.perf_counter() - start) * 1000, 2),
        }

    try:
        pool = await get_pool()
        async with pool.connection() as conn:
            async with conn.cursor() as cur:
                await cur.execute("SELECT 1 AS health_check")
                await cur.fetchone()
        return {
            "connected": True,
            "latency_ms": round((time.perf_counter() - start) * 1000, 2),
        }
    except Exception as exc:
        return {
            "connected": False,
            "latency_ms": round((time.perf_counter() - start) * 1000, 2),
            "error": str(exc) or "Database connection error",
        }


async def close_pool() -> None:
    """Gracefully close the database connection pool."""
    global _custom_pool, _pg_pool, _use_in_memory_fallback
    _custom_pool = None
    if _pg_pool is not None:
        await _pg_pool.close()
        _pg_pool = None
    _use_in_memory_fallback = False
