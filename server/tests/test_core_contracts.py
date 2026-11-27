"""Tests for Core Backend Config, CORS, Errors, Health, and Demo Seed Contracts."""

from __future__ import annotations

from collections.abc import Iterator
from typing import Any

import pytest
from fastapi.testclient import TestClient

from src import app as app_module
from src import config as config_module
from src.db import pool as db_pool
from src.db.in_memory_db import ANJALI_USER_ID, RAMESH_USER_ID, InMemoryDb
from src.middleware.errors import AppError


@pytest.fixture
def isolated_client() -> Iterator[TestClient]:
    InMemoryDb.get_instance().reset(seed_demo=True)
    db_pool.enable_in_memory_fallback()
    test_app = app_module.create_app()
    with TestClient(test_app) as c:
        yield c


def test_parse_cors_origins_and_load_config(monkeypatch: pytest.MonkeyPatch) -> None:
    assert config_module.parse_cors_origins("*") == (["*"], False)
    assert config_module.parse_cors_origins("") == (["*"], False)
    assert config_module.parse_cors_origins("http://localhost:8081, *") == (["*"], False)
    assert config_module.parse_cors_origins(
        "http://localhost:8081, http://localhost:19006"
    ) == (["http://localhost:8081", "http://localhost:19006"], True)

    monkeypatch.setenv("NODE_ENV", "production")
    monkeypatch.delenv("DATABASE_URL", raising=False)
    monkeypatch.delenv("ALLOW_IN_MEMORY_FALLBACK", raising=False)
    prod_cfg = config_module.load_config()
    assert prod_cfg.allow_in_memory_fallback is False

    monkeypatch.setenv("NODE_ENV", "development")
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/db")
    explicit_cfg = config_module.load_config()
    assert explicit_cfg.database_url_explicit is True
    assert explicit_cfg.allow_in_memory_fallback is False

    monkeypatch.setenv("ALLOW_IN_MEMORY_FALLBACK", "true")
    monkeypatch.setenv("USE_IN_MEMORY_DB", "true")
    override_cfg = config_module.load_config()
    assert override_cfg.allow_in_memory_fallback is True
    assert override_cfg.use_in_memory_db is True


def test_cors_middleware_wildcard_vs_explicit_origins(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    InMemoryDb.get_instance().reset(seed_demo=True)
    db_pool.enable_in_memory_fallback()

    monkeypatch.setenv("CORS_ORIGIN", "*")
    wildcard_cfg = config_module.load_config()
    monkeypatch.setattr(app_module, "config", wildcard_cfg)
    wildcard_app = app_module.create_app()
    with TestClient(wildcard_app) as c:
        res = c.get("/health", headers={"Origin": "http://localhost:8081"})
        assert res.status_code == 200
        assert res.headers.get("access-control-allow-origin") == "*"
        assert res.headers.get("access-control-allow-credentials") != "true"

    monkeypatch.setenv("CORS_ORIGIN", "http://localhost:8081, http://localhost:19006")
    explicit_cfg = config_module.load_config()
    monkeypatch.setattr(app_module, "config", explicit_cfg)
    explicit_app = app_module.create_app()
    with TestClient(explicit_app) as c:
        ok_res = c.get("/health", headers={"Origin": "http://localhost:8081"})
        assert ok_res.status_code == 200
        assert ok_res.headers.get("access-control-allow-origin") == "http://localhost:8081"
        assert ok_res.headers.get("access-control-allow-credentials") == "true"

        bad_res = c.get("/health", headers={"Origin": "https://evil.example.com"})
        assert bad_res.status_code == 200
        assert bad_res.headers.get("access-control-allow-origin") is None


def test_health_ready_returns_503_when_disconnected(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    async def disconnected_health() -> dict[str, Any]:
        return {
            "connected": False,
            "mode": "postgresql",
            "latency_ms": 5.0,
            "error": "connection refused",
        }

    test_app = app_module.create_app()
    monkeypatch.setattr("src.routes.health.check_health", disconnected_health)
    with TestClient(test_app) as c:
        ready = c.get("/health/ready")
        assert ready.status_code == 503
        body = ready.json()
        assert body["status"] == "not_ready"
        assert body["database"] == "disconnected"
        assert body["error"] == "connection refused"


def test_error_envelopes_and_x_request_id(isolated_client: TestClient) -> None:
    # 400 VALIDATION_ERROR with X-Request-ID echo
    res_400 = isolated_client.post(
        "/api/v1/users",
        json={},
        headers={"X-Request-ID": "req-contract-400"},
    )
    assert res_400.status_code == 400
    assert res_400.headers.get("x-request-id") == "req-contract-400"
    body_400 = res_400.json()
    assert body_400["success"] is False
    assert body_400["error"]["code"] == "VALIDATION_ERROR"
    assert body_400["error"]["request_id"] == "req-contract-400"
    assert isinstance(body_400["error"]["details"], list)

    # 404 NOT_FOUND with auto-generated X-Request-ID
    res_404 = isolated_client.get("/api/v1/does-not-exist")
    assert res_404.status_code == 404
    req_id_404 = res_404.headers.get("x-request-id")
    assert req_id_404
    assert res_404.json()["success"] is False
    assert res_404.json()["error"]["code"] == "NOT_FOUND"
    assert res_404.json()["error"]["request_id"] == req_id_404

    # 409 CONFLICT on duplicate demo email
    res_409 = isolated_client.post(
        "/api/v1/users",
        json={"name": "Dup", "email": "anjali@kinguardian.com", "role": "coordinator"},
    )
    assert res_409.status_code == 409
    assert res_409.json()["success"] is False
    assert res_409.json()["error"]["code"] == "CONFLICT"


def test_unhandled_and_app_error_handler() -> None:
    test_app = app_module.create_app()

    @test_app.get("/_test/app-error")
    async def raise_app_error() -> None:
        raise AppError(403, "FORBIDDEN", "Access denied")

    @test_app.get("/_test/boom")
    async def raise_boom() -> None:
        raise RuntimeError("unexpected failure")

    InMemoryDb.get_instance().reset(seed_demo=True)
    db_pool.enable_in_memory_fallback()
    with TestClient(test_app, raise_server_exceptions=False) as c:
        r1 = c.get("/_test/app-error")
        assert r1.status_code == 403
        assert r1.json()["error"]["code"] == "FORBIDDEN"

        r2 = c.get("/_test/boom", headers={"X-Request-ID": "req-500"})
        assert r2.status_code == 500
        assert r2.json()["success"] is False
        assert r2.json()["error"]["code"] == "INTERNAL_SERVER_ERROR"
        assert r2.json()["error"]["request_id"] == "req-500"


def test_seeded_demo_users_and_contacts_endpoints(isolated_client: TestClient) -> None:
    anjali_res = isolated_client.get(f"/api/v1/users/{ANJALI_USER_ID}")
    assert anjali_res.status_code == 200
    assert anjali_res.json()["data"]["email"] == "anjali@kinguardian.com"
    assert anjali_res.json()["data"]["role"] == "coordinator"

    ramesh_res = isolated_client.get(f"/api/v1/users/{RAMESH_USER_ID}")
    assert ramesh_res.status_code == 200
    assert ramesh_res.json()["data"]["email"] == "ramesh@kinguardian.com"
    assert ramesh_res.json()["data"]["role"] == "parent"

    contacts_res = isolated_client.get(f"/api/v1/users/{RAMESH_USER_ID}/contacts")
    assert contacts_res.status_code == 200
    contacts = contacts_res.json()["data"]
    assert len(contacts) == 3
    assert [c["priority"] for c in contacts] == [1, 2, 3]
    assert contacts[0]["name"] == "Priya"
