"""Centralized error handling and AppError definition."""

from __future__ import annotations

import logging
from typing import Any, Optional

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger("kinguardian.errors")


class AppError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Optional[Any] = None,
    ) -> None:
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details


def _request_id(request: Request) -> Optional[str]:
    return getattr(request.state, "request_id", None) or request.headers.get("x-request-id")


def _error_payload(
    code: str,
    message: str,
    request_id: Optional[str],
    details: Optional[Any] = None,
) -> dict[str, Any]:
    err: dict[str, Any] = {
        "code": code,
        "message": message,
        "request_id": request_id,
    }
    if details is not None:
        err["details"] = details
    return {"success": False, "error": err}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_payload(exc.code, exc.message, _request_id(request), exc.details),
        )

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(
        request: Request, exc: RequestValidationError
    ) -> JSONResponse:
        details = [
            {
                "path": ".".join(str(p) for p in err.get("loc", [])),
                "message": err.get("msg", "Invalid value"),
                "code": err.get("type", "validation_error"),
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=400,
            content=_error_payload(
                "VALIDATION_ERROR",
                "Invalid request data",
                _request_id(request),
                details,
            ),
        )

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(
        request: Request, exc: StarletteHTTPException
    ) -> JSONResponse:
        if exc.status_code == 404:
            return JSONResponse(
                status_code=404,
                content=_error_payload(
                    "NOT_FOUND",
                    f"Route not found: {request.method} {request.url.path}",
                    _request_id(request),
                ),
            )
        status_code_map = {
            400: "BAD_REQUEST",
            401: "UNAUTHORIZED",
            403: "FORBIDDEN",
            409: "CONFLICT",
        }
        code = status_code_map.get(exc.status_code, "HTTP_ERROR")
        return JSONResponse(
            status_code=exc.status_code,
            content=_error_payload(
                code,
                str(exc.detail),
                _request_id(request),
            ),
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        req_id = _request_id(request)
        pg_code = getattr(exc, "sqlstate", None) or getattr(exc, "code", None)

        if pg_code == "23505":
            return JSONResponse(
                status_code=409,
                content=_error_payload(
                    "CONFLICT",
                    getattr(exc, "detail", None)
                    or "A record with this unique field already exists.",
                    req_id,
                ),
            )
        if pg_code == "23503":
            return JSONResponse(
                status_code=400,
                content=_error_payload(
                    "FOREIGN_KEY_VIOLATION",
                    getattr(exc, "detail", None) or "Referenced entity does not exist.",
                    req_id,
                ),
            )
        if pg_code == "22P02":
            return JSONResponse(
                status_code=400,
                content=_error_payload(
                    "BAD_REQUEST",
                    "Invalid input syntax for type UUID or integer.",
                    req_id,
                ),
            )

        logger.exception("[Unhandled Error] [Req: %s]", req_id, exc_info=exc)
        return JSONResponse(
            status_code=500,
            content=_error_payload(
                "INTERNAL_SERVER_ERROR",
                "An unexpected internal server error occurred.",
                req_id,
            ),
        )
