"""Unit tests for PostgreSQL pool lifecycle, fallback rules, and InMemoryDb."""

from __future__ import annotations

import asyncio
from dataclasses import replace
from typing import Any, Optional

import pytest
from psycopg_pool import PoolTimeout

from src.config import config as app_config
from src.db import pool as db_pool
from src.db.in_memory_db import (
    ANJALI_USER_ID,
    DEFAULT_FAMILY_ID,
    RAMESH_USER_ID,
    DatabaseError,
    InMemoryDb,
    QueryResult,
)


@pytest.fixture(autouse=True)
async def reset_pool_and_db(monkeypatch: pytest.MonkeyPatch) -> Any:
    await db_pool.close_pool()
    InMemoryDb.get_instance().reset(seed_demo=True)
    monkeypatch.setattr(db_pool, "config", app_config)
    yield
    await db_pool.close_pool()
    InMemoryDb.get_instance().reset(seed_demo=True)


def test_in_memory_db_seeds_demo_data_idempotently() -> None:
    db = InMemoryDb.get_instance()
    db.seed_demo_data()
    db.seed_demo_data()

    assert ANJALI_USER_ID in db.users
    assert RAMESH_USER_ID in db.users
    assert DEFAULT_FAMILY_ID in db.families
    assert db.users[ANJALI_USER_ID]["role"] == "coordinator"
    assert db.users[RAMESH_USER_ID]["role"] == "parent"

    ramesh_contacts = [
        c for c in db.contacts.values() if c["user_id"] == RAMESH_USER_ID
    ]
    assert len(ramesh_contacts) == 3

    db.reset(seed_demo=False)
    assert len(db.users) == 0
    assert len(db.contacts) == 0
    assert len(db.families) == 0


async def test_in_memory_db_email_uniqueness_on_insert_and_update() -> None:
    db = InMemoryDb.get_instance()
    u1_res = await db.query(
        "INSERT INTO users (name, email, phone, role, blood_group, medical_conditions, allergies, address, city, country, timezone, emergency_notes, avatar_url) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *;",
        ["User One", "one@example.com", None, "parent", None, "[]", "[]", None, None, "India", "Asia/Kolkata", None, None],
    )
    u2_res = await db.query(
        "INSERT INTO users (name, email, phone, role, blood_group, medical_conditions, allergies, address, city, country, timezone, emergency_notes, avatar_url) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *;",
        ["User Two", "two@example.com", None, "parent", None, "[]", "[]", None, None, "India", "Asia/Kolkata", None, None],
    )
    u2_id = u2_res.rows[0]["id"]

    # Case-insensitive email lookup
    found = await db.query(
        "SELECT * FROM users WHERE email = %s", ["ONE@EXAMPLE.COM"]
    )
    assert found.row_count == 1
    assert found.rows[0]["id"] == u1_res.rows[0]["id"]

    # Duplicate email on UPDATE raises DatabaseError(23505)
    with pytest.raises(DatabaseError) as exc_info:
        await db.query(
            "UPDATE users SET email = %s WHERE id = %s RETURNING *;",
            ["ONE@example.com", u2_id],
        )
    assert exc_info.value.code == "23505"
    assert db.users[u2_id]["email"] == "two@example.com"


async def test_in_memory_db_cascade_delete_user() -> None:
    db = InMemoryDb.get_instance()
    u_res = await db.query(
        "INSERT INTO users (name, email, phone, role, blood_group, medical_conditions, allergies, address, city, country, timezone, emergency_notes, avatar_url) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *;",
        ["Cascade User", "cascade@example.com", None, "parent", None, "[]", "[]", None, None, "India", "Asia/Kolkata", None, None],
    )
    uid = u_res.rows[0]["id"]

    await db.query(
        "INSERT INTO emergency_contacts (user_id, name, relationship, phone, email, is_primary, priority) VALUES (%s, %s, %s, %s, %s, %s, %s) RETURNING *;",
        [uid, "Contact", "Son", "+911234567890", None, True, 1],
    )
    await db.query(
        "INSERT INTO alerts (user_id, type, severity, status, location_coords, location_name, description, metadata) VALUES (%s, %s, %s, %s, %s, %s, %s, %s) RETURNING *;",
        [uid, "sos", "critical", "triggered", None, "Home", "Help", "{}"],
    )

    del_res = await db.query("DELETE FROM users WHERE id = %s RETURNING id", [uid])
    assert del_res.row_count == 1
    assert not any(c["user_id"] == uid for c in db.contacts.values())
    assert not any(a["user_id"] == uid for a in db.alerts.values())


async def test_get_pool_does_not_poison_on_open_timeout_and_respects_lock(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    open_calls = 0
    close_calls = 0

    class FailingPool:
        def __init__(self, *args: Any, **kwargs: Any) -> None:
            self.closed = False

        async def open(self, wait: bool = True, timeout: float = 2.0) -> None:
            nonlocal open_calls
            open_calls += 1
            self.closed = True
            raise PoolTimeout(f"pool initialization incomplete after {timeout} sec")

        async def close(self) -> None:
            nonlocal close_calls
            close_calls += 1
            self.closed = True

    monkeypatch.setattr(db_pool, "AsyncConnectionPool", FailingPool)

    with pytest.raises(PoolTimeout):
        await db_pool.get_pool()

    assert open_calls == 1
    assert close_calls == 1
    assert db_pool._pg_pool is None

    # Concurrent get_pool() with a healthy pool opens only once
    healthy_opens = 0

    class HealthyPool:
        def __init__(self, *args: Any, **kwargs: Any) -> None:
            self.closed = False

        async def open(self, wait: bool = True, timeout: float = 2.0) -> None:
            nonlocal healthy_opens
            healthy_opens += 1
            await asyncio.sleep(0.01)

        async def close(self) -> None:
            self.closed = True

    monkeypatch.setattr(db_pool, "AsyncConnectionPool", HealthyPool)
    p1, p2 = await asyncio.gather(db_pool.get_pool(), db_pool.get_pool())
    assert p1 is p2
    assert healthy_opens == 1

    # Closed _pg_pool is discarded and replaced on next get_pool()
    p1.closed = True
    p3 = await db_pool.get_pool()
    assert p3 is not p1
    assert healthy_opens == 2


async def test_query_fallback_respects_production_guard(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def fail_get_pool() -> Any:
        raise PoolTimeout("pool initialization incomplete after 2.0 sec")

    monkeypatch.setattr(db_pool, "get_pool", fail_get_pool)

    # Production config: MUST NOT silently fall back
    prod_cfg = replace(app_config, node_env="production", allow_in_memory_fallback=False)
    monkeypatch.setattr(db_pool, "config", prod_cfg)
    db_pool.disable_in_memory_fallback()

    with pytest.raises(PoolTimeout):
        await db_pool.query("SELECT * FROM users WHERE id = %s", [ANJALI_USER_ID])
    assert db_pool._use_in_memory_fallback is False

    # Dev config with fallback allowed: switches to InMemoryDb
    dev_cfg = replace(app_config, node_env="development", allow_in_memory_fallback=True)
    monkeypatch.setattr(db_pool, "config", dev_cfg)

    res = await db_pool.query("SELECT * FROM users WHERE id = %s", [ANJALI_USER_ID])
    assert res.row_count == 1
    assert res.rows[0]["email"] == "anjali@kinguardian.com"
    assert db_pool._use_in_memory_fallback is True


async def test_query_does_not_fallback_on_non_connection_sql_error(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    dev_cfg = replace(app_config, node_env="development", allow_in_memory_fallback=True)
    monkeypatch.setattr(db_pool, "config", dev_cfg)

    class BrokenCursor:
        description: Optional[Any] = None
        rowcount = 0

        async def __aenter__(self) -> "BrokenCursor":
            return self

        async def __aexit__(self, *args: Any) -> None:
            return None

        async def execute(self, text: str, params: list[Any]) -> None:
            raise DatabaseError("unique constraint violation", code="23505")

    class BrokenConn:
        async def __aenter__(self) -> "BrokenConn":
            return self

        async def __aexit__(self, *args: Any) -> None:
            return None

        def cursor(self) -> BrokenCursor:
            return BrokenCursor()

    class BrokenPool:
        def connection(self) -> BrokenConn:
            return BrokenConn()

    async def fake_get_pool() -> BrokenPool:
        return BrokenPool()

    monkeypatch.setattr(db_pool, "get_pool", fake_get_pool)

    with pytest.raises(DatabaseError) as exc_info:
        await db_pool.query("INSERT INTO users ...")
    assert exc_info.value.code == "23505"
    assert db_pool._use_in_memory_fallback is False


async def test_custom_pool_and_check_health_modes() -> None:
    class CustomPool:
        async def query(self, text: str, params: Optional[list[Any]] = None) -> QueryResult:
            return QueryResult(rows=[{"health_check": 1}], row_count=1)

    db_pool.set_pool(CustomPool())
    custom_health = await db_pool.check_health()
    assert custom_health["connected"] is True
    assert custom_health["mode"] == "custom"

    res = await db_pool.query("SELECT 1")
    assert res.rows == [{"health_check": 1}]

    await db_pool.close_pool()
    db_pool.enable_in_memory_fallback()
    mem_health = await db_pool.check_health()
    assert mem_health["connected"] is True
    assert mem_health["mode"] == "in_memory"
