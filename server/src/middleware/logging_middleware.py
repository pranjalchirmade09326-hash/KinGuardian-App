"""Correlation ID (X-Request-ID) and HTTP request logging middleware."""

from __future__ import annotations

import logging
import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

logger = logging.getLogger("kinguardian.http")


class CorrelationAndLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        req_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = req_id

        start = time.perf_counter()
        response = await call_next(request)
        elapsed_ms = (time.perf_counter() - start) * 1000

        response.headers["X-Request-ID"] = req_id
        logger.info(
            "[%s] %s %s %s %.2f ms",
            req_id,
            request.method,
            request.url.path,
            response.status_code,
            elapsed_ms,
        )
        return response
