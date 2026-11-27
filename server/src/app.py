"""FastAPI application factory with middleware, error handlers, and routes."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import config
from src.db.pool import check_health, close_pool
from src.middleware.errors import register_exception_handlers
from src.middleware.logging_middleware import CorrelationAndLoggingMiddleware
from src.routes import api_v1_router
from src.routes.health import health_router
from whatsapp_webhook_server import whatsapp_compat_router, whatsapp_router

logger = logging.getLogger("kinguardian.app")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    try:
        health = await check_health()
        if health["connected"]:
            logger.info(
                "[DB] Database ready (mode=%s, %.2fms)",
                health.get("mode", "postgresql"),
                health.get("latency_ms", 0),
            )
        else:
            logger.warning(
                "[DB] PostgreSQL not immediately reachable: %s", health.get("error")
            )
    except Exception as exc:
        logger.warning("[DB] Could not connect to PostgreSQL: %s", exc)

    yield

    await close_pool()
    logger.info("[DB] Database connection pool closed.")


def create_app() -> FastAPI:
    app = FastAPI(
        title="KinGuardian Backend Service",
        description="KinGuardian Backend Service and Database API (Python / FastAPI)",
        version="1.0.0",
        lifespan=lifespan,
    )

    app.add_middleware(CorrelationAndLoggingMiddleware)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.cors_origins,
        allow_credentials=config.cors_allow_credentials,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )

    register_exception_handlers(app)

    app.include_router(health_router)
    app.include_router(api_v1_router)
    app.include_router(whatsapp_router, prefix="/api/v1/whatsapp")
    app.include_router(whatsapp_router, prefix="/whatsapp", include_in_schema=False)
    app.include_router(whatsapp_compat_router)

    return app


app = create_app()
