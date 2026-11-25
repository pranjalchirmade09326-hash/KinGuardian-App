"""Emergency contact data access model."""

from __future__ import annotations

from typing import Any, Optional

from src.db.pool import query
from src.schemas import ContactCreate, ContactUpdate


class ContactModel:
    @staticmethod
    async def create(user_id: str, data: ContactCreate) -> dict[str, Any]:
        if data.is_primary:
            await query(
                "UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = %s",
                [user_id],
            )

        sql = """
            INSERT INTO emergency_contacts (
                user_id, name, relationship, phone, email, is_primary, priority
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING *;
        """
        params = [
            user_id,
            data.name,
            data.relationship,
            data.phone,
            str(data.email) if data.email else None,
            bool(data.is_primary),
            data.priority if data.priority >= 0 else 1,
        ]
        result = await query(sql, params)
        return result.rows[0]

    @staticmethod
    async def find_by_id(contact_id: str) -> Optional[dict[str, Any]]:
        result = await query("SELECT * FROM emergency_contacts WHERE id = %s", [contact_id])
        return result.rows[0] if result.rows else None

    @staticmethod
    async def list_by_user_id(user_id: str) -> list[dict[str, Any]]:
        sql = """
            SELECT * FROM emergency_contacts
            WHERE user_id = %s
            ORDER BY priority ASC, created_at ASC;
        """
        result = await query(sql, [user_id])
        return result.rows

    @staticmethod
    async def update(contact_id: str, data: ContactUpdate) -> Optional[dict[str, Any]]:
        existing = await ContactModel.find_by_id(contact_id)
        if not existing:
            return None

        updates = data.model_dump(exclude_unset=True)
        if updates.get("is_primary") is True:
            await query(
                "UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = %s AND id != %s",
                [existing["user_id"], contact_id],
            )

        if not updates:
            return existing

        fields: list[str] = []
        params: list[Any] = []
        for field_name, val in updates.items():
            fields.append(f"{field_name} = %s")
            params.append(str(val) if field_name == "email" and val is not None else val)

        params.append(contact_id)
        sql = f"""
            UPDATE emergency_contacts
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING *;
        """
        result = await query(sql, params)
        return result.rows[0] if result.rows else None

    @staticmethod
    async def delete(contact_id: str) -> bool:
        result = await query(
            "DELETE FROM emergency_contacts WHERE id = %s RETURNING id", [contact_id]
        )
        return result.row_count > 0
