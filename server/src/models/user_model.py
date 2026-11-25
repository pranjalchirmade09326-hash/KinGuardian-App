"""User data access model."""

from __future__ import annotations

import json
from typing import Any, Optional

from src.db.pool import query
from src.schemas import UserCreate, UserUpdate


class UserModel:
    @staticmethod
    async def create(data: UserCreate) -> dict[str, Any]:
        sql = """
            INSERT INTO users (
                name, email, phone, role, blood_group, medical_conditions, allergies,
                address, city, country, timezone, emergency_notes, avatar_url
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *;
        """
        params = [
            data.name,
            str(data.email),
            data.phone or None,
            data.role or "parent",
            data.blood_group or None,
            json.dumps(data.medical_conditions or []),
            json.dumps(data.allergies or []),
            data.address or None,
            data.city or None,
            data.country or "India",
            data.timezone or "Asia/Kolkata",
            data.emergency_notes or None,
            data.avatar_url or None,
        ]
        result = await query(sql, params)
        return result.rows[0]

    @staticmethod
    async def find_by_id(user_id: str) -> Optional[dict[str, Any]]:
        result = await query("SELECT * FROM users WHERE id = %s", [user_id])
        return result.rows[0] if result.rows else None

    @staticmethod
    async def find_by_email(email: str) -> Optional[dict[str, Any]]:
        result = await query("SELECT * FROM users WHERE email = %s", [email])
        return result.rows[0] if result.rows else None

    @staticmethod
    async def list(
        role: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> tuple[list[dict[str, Any]], int]:
        conditions: list[str] = []
        params: list[Any] = []

        if role:
            conditions.append("role = %s")
            params.append(role)

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        count_res = await query(f"SELECT COUNT(*) AS total FROM users {where_clause}", params)
        total = int(count_res.rows[0]["total"]) if count_res.rows else 0

        eff_limit = limit if limit and limit > 0 else 50
        eff_offset = offset if offset is not None and offset >= 0 else 0

        data_sql = f"""
            SELECT * FROM users
            {where_clause}
            ORDER BY created_at DESC
            LIMIT %s OFFSET %s
        """
        data_res = await query(data_sql, [*params, eff_limit, eff_offset])
        return data_res.rows, total

    @staticmethod
    async def update(user_id: str, data: UserUpdate) -> Optional[dict[str, Any]]:
        updates = data.model_dump(exclude_unset=True)
        if not updates:
            return await UserModel.find_by_id(user_id)

        fields: list[str] = []
        params: list[Any] = []
        for field_name, val in updates.items():
            fields.append(f"{field_name} = %s")
            if field_name in ("medical_conditions", "allergies"):
                params.append(json.dumps(val if val is not None else []))
            elif field_name == "email" and val is not None:
                params.append(str(val))
            else:
                params.append(val)

        params.append(user_id)
        sql = f"""
            UPDATE users
            SET {', '.join(fields)}
            WHERE id = %s
            RETURNING *;
        """
        result = await query(sql, params)
        return result.rows[0] if result.rows else None

    @staticmethod
    async def delete(user_id: str) -> bool:
        result = await query("DELETE FROM users WHERE id = %s RETURNING id", [user_id])
        return result.row_count > 0
