"""Alert and incident data access model."""

from __future__ import annotations

import json
from typing import Any, Optional

from src.db.pool import query
from src.schemas import AlertCreate


class AlertModel:
    @staticmethod
    async def create(data: AlertCreate) -> dict[str, Any]:
        sql = """
            INSERT INTO alerts (
                user_id, type, severity, status, location_coords, location_name, description, metadata
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING *;
        """
        coords_json = (
            json.dumps(data.location_coords.model_dump(exclude_none=True))
            if data.location_coords is not None
            else None
        )
        params = [
            data.userId,
            data.type,
            data.severity or "medium",
            data.status or "triggered",
            coords_json,
            data.location_name or None,
            data.description,
            json.dumps(data.metadata or {}),
        ]
        result = await query(sql, params)
        return result.rows[0]

    @staticmethod
    async def find_by_id(alert_id: str) -> Optional[dict[str, Any]]:
        result = await query("SELECT * FROM alerts WHERE id = %s", [alert_id])
        return result.rows[0] if result.rows else None

    @staticmethod
    async def list(
        user_id: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None,
    ) -> tuple[list[dict[str, Any]], int]:
        conditions: list[str] = []
        params: list[Any] = []

        if user_id:
            conditions.append("user_id = %s")
            params.append(user_id)
        if status:
            conditions.append("status = %s")
            params.append(status)
        if severity:
            conditions.append("severity = %s")
            params.append(severity)

        where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

        count_res = await query(f"SELECT COUNT(*) AS total FROM alerts {where_clause}", params)
        total = int(count_res.rows[0]["total"]) if count_res.rows else 0

        eff_limit = limit if limit and limit > 0 else 50
        eff_offset = offset if offset is not None and offset >= 0 else 0

        data_sql = f"""
            SELECT * FROM alerts
            {where_clause}
            ORDER BY triggered_at DESC
            LIMIT %s OFFSET %s
        """
        data_res = await query(data_sql, [*params, eff_limit, eff_offset])
        return data_res.rows, total

    @staticmethod
    async def acknowledge(alert_id: str, acknowledged_by: str) -> Optional[dict[str, Any]]:
        sql = """
            UPDATE alerts
            SET status = 'acknowledged',
                acknowledged_at = CURRENT_TIMESTAMP,
                acknowledged_by = %s
            WHERE id = %s
            RETURNING *;
        """
        result = await query(sql, [acknowledged_by, alert_id])
        # Note: in_memory_db checks params[0] as id for acknowledge; let's keep param order consistent:
        return result.rows[0] if result.rows else None

    @staticmethod
    async def resolve(alert_id: str, resolution_notes: str) -> Optional[dict[str, Any]]:
        sql = """
            UPDATE alerts
            SET status = 'resolved',
                resolved_at = CURRENT_TIMESTAMP,
                resolution_notes = %s
            WHERE id = %s
            RETURNING *;
        """
        result = await query(sql, [resolution_notes, alert_id])
        return result.rows[0] if result.rows else None

    @staticmethod
    async def delete(alert_id: str) -> bool:
        result = await query("DELETE FROM alerts WHERE id = %s RETURNING id", [alert_id])
        return result.row_count > 0
