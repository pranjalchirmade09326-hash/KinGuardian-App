"""Health check routes."""

from __future__ import annotations

import time
from datetime import datetime, timezone

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from src.db.pool import check_health

_START_TIME = time.monotonic()

health_router = APIRouter(tags=["Health"])


@health_router.get("/health")
async def health() -> dict:
    db_health = await check_health()
    payload: dict = {
        "status": "ok",
        "uptime": round(time.monotonic() - _START_TIME, 3),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": "connected" if db_health["connected"] else "disconnected",
    }
    if "latency_ms" in db_health:
        payload["db_latency_ms"] = db_health["latency_ms"]
    return payload


@health_router.get("/health/ready")
async def health_ready() -> JSONResponse:
    db_health = await check_health()
    if db_health["connected"]:
        return JSONResponse(
            status_code=200,
            content={
                "status": "ready",
                "database": "connected",
                "db_latency_ms": db_health.get("latency_ms"),
            },
        )
    return JSONResponse(
        status_code=503,
        content={
            "status": "not_ready",
            "database": "disconnected",
            "error": db_health.get("error"),
        },
    )
