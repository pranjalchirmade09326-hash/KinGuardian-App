"""User profile routes and nested user sub-resources."""

from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Query, Response, status

from src.middleware.errors import AppError
from src.models.alert_model import AlertModel
from src.models.contact_model import ContactModel
from src.models.user_model import UserModel
from src.schemas import (
    AlertSeverity,
    AlertStatus,
    ContactCreate,
    UserCreate,
    UserRole,
    UserUpdate,
)

users_router = APIRouter(tags=["Users"])


@users_router.post("", status_code=status.HTTP_201_CREATED)
@users_router.post("/", status_code=status.HTTP_201_CREATED, include_in_schema=False)
async def create_user(payload: UserCreate) -> dict:
    existing = await UserModel.find_by_email(str(payload.email))
    if existing:
        raise AppError(409, "CONFLICT", "A user with this email already exists.")
    user = await UserModel.create(payload)
    return {"success": True, "data": user}


@users_router.get("")
@users_router.get("/", include_in_schema=False)
async def list_users(
    role: Optional[UserRole] = None,
    limit: Optional[int] = Query(default=None, ge=1, le=100),
    offset: Optional[int] = Query(default=None, ge=0),
) -> dict:
    users, total = await UserModel.list(role=role, limit=limit, offset=offset)
    return {"success": True, "data": users, "count": total}


@users_router.get("/{user_id}")
async def get_user_by_id(user_id: UUID) -> dict:
    user = await UserModel.find_by_id(str(user_id))
    if not user:
        raise AppError(404, "NOT_FOUND", f"User with ID {user_id} not found.")
    return {"success": True, "data": user}


@users_router.patch("/{user_id}")
async def update_user(user_id: UUID, payload: UserUpdate) -> dict:
    existing = await UserModel.find_by_id(str(user_id))
    if not existing:
        raise AppError(404, "NOT_FOUND", f"User with ID {user_id} not found.")

    if payload.email and str(payload.email) != existing["email"]:
        email_user = await UserModel.find_by_email(str(payload.email))
        if email_user:
            raise AppError(409, "CONFLICT", "Another user with this email already exists.")

    updated = await UserModel.update(str(user_id), payload)
    return {"success": True, "data": updated}


@users_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: UUID) -> Response:
    existing = await UserModel.find_by_id(str(user_id))
    if not existing:
        raise AppError(404, "NOT_FOUND", f"User with ID {user_id} not found.")
    await UserModel.delete(str(user_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Sub-resource: /api/v1/users/{user_id}/contacts
@users_router.get("/{user_id}/contacts")
async def list_user_contacts(user_id: UUID) -> dict:
    user = await UserModel.find_by_id(str(user_id))
    if not user:
        raise AppError(404, "NOT_FOUND", f"User with ID {user_id} not found.")
    contacts = await ContactModel.list_by_user_id(str(user_id))
    return {"success": True, "data": contacts}


@users_router.post("/{user_id}/contacts", status_code=status.HTTP_201_CREATED)
async def create_user_contact(user_id: UUID, payload: ContactCreate) -> dict:
    user = await UserModel.find_by_id(str(user_id))
    if not user:
        raise AppError(404, "NOT_FOUND", f"User with ID {user_id} not found.")
    contact = await ContactModel.create(str(user_id), payload)
    return {"success": True, "data": contact}


# Sub-resource: /api/v1/users/{user_id}/alerts
@users_router.get("/{user_id}/alerts")
async def list_user_alerts(
    user_id: UUID,
    alert_status: Optional[AlertStatus] = Query(default=None, alias="status"),
    severity: Optional[AlertSeverity] = None,
    limit: Optional[int] = Query(default=None, ge=1, le=100),
    offset: Optional[int] = Query(default=None, ge=0),
) -> dict:
    user = await UserModel.find_by_id(str(user_id))
    if not user:
        raise AppError(404, "NOT_FOUND", f"User with ID {user_id} not found.")
    alerts, total = await AlertModel.list(
        user_id=str(user_id),
        status=alert_status,
        severity=severity,
        limit=limit,
        offset=offset,
    )
    return {"success": True, "data": alerts, "count": total}
