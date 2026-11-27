"""PostgreSQL async connection pool with automatic in-memory fallback."""

from __future__ import annotations

import asyncio
import logging
import time
from typing import Any, Optional

import psycopg
from psycopg.rows import dict_row
from psycopg_pool import AsyncConnectionPool, PoolClosed, PoolTimeout

from src.config import config
from src.db.in_memory_db import InMemoryDb, QueryResult

logger = logging.getLogger("kinguardian.db")

_custom_pool: Any = None
_pg_pool: Optional[AsyncConnectionPool] = None
_use_in_memory_fallback: bool = config.use_in_memory_db
_pool_lock: Optional[asyncio.Lock] = None
_pool_lock_loop: Optional[asyncio.AbstractEventLoop] = None

_CONNECTION_ERROR_TOKENS = (
    "connection",
    "timeout",
    "refused",
    "could not connect",
    "network",
    "eacces",
    "pool initialization incomplete",
)


def _get_pool_lock() -> asyncio.Lock:
    global _pool_lock, _pool_lock_loop
    current_loop = asyncio.get_running_loop()
    if _pool_lock is None or _pool_lock_loop is not current_loop:
        _pool_lock = asyncio.Lock()
        _pool_lock_loop = current_loop
    return _pool_lock


def _is_connection_error(exc: Exception) -> bool:
    if isinstance(exc, (OSError, PoolTimeout, PoolClosed, psycopg.OperationalError)):
        return True
    err_msg = str(exc).lower()
    return any(token in err_msg for token in _CONNECTION_ERROR_TOKENS)


async def get_pool() -> Any:
    global _pg_pool
    if _custom_pool is not None:
        return _custom_pool

    async with _get_pool_lock():
        if _custom_pool is not None:
            return _custom_pool
        if _pg_pool is not None:
            if getattr(_pg_pool, "closed", False):
                _pg_pool = None
            else:
                return _pg_pool

        pool = AsyncConnectionPool(
            conninfo=config.database_url,
            min_size=1,
            max_size=20,
            timeout=2.0,
            open=False,
            kwargs={"row_factory": dict_row},
        )
        try:
            await pool.open(wait=True, timeout=2.0)
        except Exception:
            try:
                await pool.close()
            except Exception:
                pass
            _pg_pool = None
            raise

        _pg_pool = pool
        return _pg_pool


def set_pool(custom_pool: Any) -> None:
    """Override or inject a custom pool (useful for unit tests)."""
    global _custom_pool
    _custom_pool = custom_pool


def enable_in_memory_fallback() -> None:
    """Enable the in-memory database fallback explicitly."""
    global _use_in_memory_fallback
    _use_in_memory_fallback = True


def disable_in_memory_fallback() -> None:
    """Disable the in-memory database fallback explicitly."""
    global _use_in_memory_fallback
    _use_in_memory_fallback = False


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
        if config.allow_in_memory_fallback and _is_connection_error(exc):
            logger.warning(
                "PostgreSQL unreachable (%s); switching to in-memory fallback.", exc
            )
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
                "mode": "custom",
                "latency_ms": round((time.perf_counter() - start) * 1000, 2),
            }
        except Exception as exc:
            return {
                "connected": False,
                "mode": "custom",
                "latency_ms": round((time.perf_counter() - start) * 1000, 2),
                "error": str(exc),
            }

    if _use_in_memory_fallback:
        return {
            "connected": True,
            "mode": "in_memory",
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
            "mode": "postgresql",
            "latency_ms": round((time.perf_counter() - start) * 1000, 2),
        }
    except Exception as exc:
        return {
            "connected": False,
            "mode": "postgresql",
            "latency_ms": round((time.perf_counter() - start) * 1000, 2),
            "error": str(exc) or "Database connection error",
        }


async def close_pool() -> None:
    """Gracefully close the database connection pool."""
    global _custom_pool, _pg_pool, _use_in_memory_fallback, _pool_lock, _pool_lock_loop
    _custom_pool = None
    if _pg_pool is not None:
        try:
            await _pg_pool.close()
        finally:
            _pg_pool = None
    _pool_lock = None
    _pool_lock_loop = None
    _use_in_memory_fallback = config.use_in_memory_db
