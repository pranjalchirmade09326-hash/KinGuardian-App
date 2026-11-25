"""Emergency contact routes (/api/v1/contacts/:id)."""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Response, status

from src.middleware.errors import AppError
from src.models.contact_model import ContactModel
from src.schemas import ContactUpdate

contacts_router = APIRouter(tags=["Contacts"])


@contacts_router.get("/{contact_id}")
async def get_contact_by_id(contact_id: UUID) -> dict:
    contact = await ContactModel.find_by_id(str(contact_id))
    if not contact:
        raise AppError(404, "NOT_FOUND", f"Contact with ID {contact_id} not found.")
    return {"success": True, "data": contact}


@contacts_router.patch("/{contact_id}")
async def update_contact(contact_id: UUID, payload: ContactUpdate) -> dict:
    existing = await ContactModel.find_by_id(str(contact_id))
    if not existing:
        raise AppError(404, "NOT_FOUND", f"Contact with ID {contact_id} not found.")
    updated = await ContactModel.update(str(contact_id), payload)
    return {"success": True, "data": updated}


@contacts_router.delete("/{contact_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contact(contact_id: UUID) -> Response:
    existing = await ContactModel.find_by_id(str(contact_id))
    if not existing:
        raise AppError(404, "NOT_FOUND", f"Contact with ID {contact_id} not found.")
    await ContactModel.delete(str(contact_id))
    return Response(status_code=status.HTTP_204_NO_CONTENT)
