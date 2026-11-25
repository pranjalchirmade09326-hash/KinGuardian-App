"""Alerts and incidents routes (/api/v1/alerts)."""

from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from src.middleware.errors import AppError
from src.models.alert_model import AlertModel
from src.models.user_model import UserModel
from src.schemas import (
    AlertAcknowledge,
    AlertCreate,
    AlertResolve,
    AlertSeverity,
    AlertStatus,
)

alerts_router = APIRouter(tags=["Alerts"])


@alerts_router.post("", status_code=status.HTTP_201_CREATED)
@alerts_router.post("/", status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_alert(payload: AlertCreate) -> dict:
    try:
        UUID(payload.userId)
    except ValueError as exc:
        raise AppError(400, "VALIDATION_ERROR", "Invalid user UUID format") from exc

    user = await UserModel.find_by_id(payload.userId)
    if not user:
        raise AppError(404, "NOT_FOUND", f"User with ID {payload.userId} not found.")

    alert = await AlertModel.create(payload)
    return {"success": True, "data": alert}


@alerts_router.get("")
@alerts_router.get("/", include_in_schema=False)
async def list_alerts(
    userId: Optional[UUID] = None,
    alert_status: Optional[AlertStatus] = Query(default=None, alias="status"),
    severity: Optional[AlertSeverity] = None,
    limit: Optional[int] = Query(default=None, ge=1, le=100),
    offset: Optional[int] = Query(default=None, ge=0),
) -> dict:
    alerts, total = await AlertModel.list(
        user_id=str(userId) if userId else None,
        status=alert_status,
        severity=severity,
        limit=limit,
        offset=offset,
    )
    return {"success": True, "data": alerts, "count": total}


@alerts_router.get("/{alert_id}")
async def get_alert_by_id(alert_id: UUID) -> dict:
    alert = await AlertModel.find_by_id(str(alert_id))
    if not alert:
        raise AppError(404, "NOT_FOUND", f"Alert with ID {alert_id} not found.")
    return {"success": True, "data": alert}


@alerts_router.patch("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: UUID, payload: AlertAcknowledge) -> dict:
    alert = await AlertModel.find_by_id(str(alert_id))
    if not alert:
        raise AppError(404, "NOT_FOUND", f"Alert with ID {alert_id} not found.")
    updated = await AlertModel.acknowledge(str(alert_id), payload.acknowledged_by)
    return {"success": True, "data": updated}


@alerts_router.patch("/{alert_id}/resolve")
async def resolve_alert(alert_id: UUID, payload: AlertResolve) -> dict:
    alert = await AlertModel.find_by_id(str(alert_id))
    if not alert:
        raise AppError(404, "NOT_FOUND", f"Alert with ID {alert_id} not found.")
    updated = await AlertModel.resolve(str(alert_id), payload.resolution_notes)
    return {"success": True, "data": updated}


@alerts_router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_alert(alert_id: UUID) -> Response:
    alert = await AlertModel.find_by_id(str(alert_id))
    if not alert:
        raise AppError(404, "NOT_FOUND", f"Alert with ID {alert_id} not found.")
    await AlertModel.delete(str(alert_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
