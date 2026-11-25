"""In-memory database fallback for local development and isolated testing."""

from __future__ import annotations

import json
import re
import uuid
from datetime import datetime, timezone
from typing import Any, Optional


class DatabaseError(Exception):
    """Simulates PostgreSQL error codes (e.g., 23505 unique violation)."""

    def __init__(self, message: str, code: str, detail: Optional[str] = None) -> None:
        super().__init__(message)
        self.code = code
        self.detail = detail or message


class QueryResult:
    def __init__(self, rows: list[dict[str, Any]], row_count: int) -> None:
        self.rows = rows
        self.row_count = row_count


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def _parse_json_field(val: Any, default: Any) -> Any:
    if val is None:
        return default
    if isinstance(val, str):
        return json.loads(val)
    return val


class InMemoryDb:
    """Singleton in-memory database mirroring the PostgreSQL schema."""

    _instance: Optional["InMemoryDb"] = None

    def __init__(self) -> None:
        self.users: dict[str, dict[str, Any]] = {}
        self.contacts: dict[str, dict[str, Any]] = {}
        self.alerts: dict[str, dict[str, Any]] = {}

    @classmethod
    def get_instance(cls) -> "InMemoryDb":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def reset(self) -> None:
        self.users.clear()
        self.contacts.clear()
        self.alerts.clear()

    async def query(self, text: str, params: Optional[list[Any]] = None) -> QueryResult:
        params = list(params or [])
        trimmed = text.strip()

        # 1. Health check probe
        if "SELECT 1" in trimmed:
            return QueryResult(rows=[{"health_check": 1}], row_count=1)

        # ------------------------------------------------------------------
        # USERS
        # ------------------------------------------------------------------
        if trimmed.startswith("INSERT INTO users"):
            (
                name,
                email,
                phone,
                role,
                blood_group,
                medical_conditions,
                allergies,
                address,
                city,
                country,
                timezone_val,
                emergency_notes,
                avatar_url,
            ) = params

            for u in self.users.values():
                if u["email"].lower() == str(email).lower():
                    raise DatabaseError(
                        'duplicate key value violates unique constraint "users_email_key"',
                        code="23505",
                    )

            uid = str(uuid.uuid4())
            now = _now_iso()
            user = {
                "id": uid,
                "name": name,
                "email": email,
                "phone": phone or None,
                "role": role or "parent",
                "blood_group": blood_group or None,
                "medical_conditions": _parse_json_field(medical_conditions, []),
                "allergies": _parse_json_field(allergies, []),
                "address": address or None,
                "city": city or None,
                "country": country or "India",
                "timezone": timezone_val or "Asia/Kolkata",
                "emergency_notes": emergency_notes or None,
                "avatar_url": avatar_url or None,
                "created_at": now,
                "updated_at": now,
            }
            self.users[uid] = user
            return QueryResult(rows=[dict(user)], row_count=1)

        if trimmed.startswith("SELECT * FROM users WHERE id = %s"):
            user = self.users.get(str(params[0]))
            return QueryResult(rows=[dict(user)] if user else [], row_count=1 if user else 0)

        if trimmed.startswith("SELECT * FROM users WHERE email = %s"):
            email = str(params[0]).lower()
            for u in self.users.values():
                if u["email"].lower() == email:
                    return QueryResult(rows=[dict(u)], row_count=1)
            return QueryResult(rows=[], row_count=0)

        if "SELECT COUNT(*) AS total FROM users" in trimmed:
            matching = list(self.users.values())
            if params and isinstance(params[0], str):
                matching = [u for u in matching if u["role"] == params[0]]
            return QueryResult(rows=[{"total": len(matching)}], row_count=1)

        if (
            "SELECT * FROM users" in trimmed
            and "WHERE id = %s" not in trimmed
            and "WHERE email = %s" not in trimmed
        ):
            matching = sorted(
                self.users.values(),
                key=lambda u: u["created_at"],
                reverse=True,
            )
            idx = 0
            if "role = %s" in trimmed and idx < len(params):
                role_val = params[idx]
                matching = [u for u in matching if u["role"] == role_val]
                idx += 1
            limit = int(params[idx]) if idx < len(params) else 50
            offset = int(params[idx + 1]) if idx + 1 < len(params) else 0
            sliced = [dict(u) for u in matching[offset : offset + limit]]
            return QueryResult(rows=sliced, row_count=len(sliced))

        if trimmed.startswith("UPDATE users"):
            uid = str(params[-1])
            user = self.users.get(uid)
            if not user:
                return QueryResult(rows=[], row_count=0)

            set_match = re.search(r"SET\s+(.*?)\s+WHERE", trimmed, re.DOTALL | re.IGNORECASE)
            if set_match:
                assignments = [a.strip() for a in set_match.group(1).split(",")]
                for i, assignment in enumerate(assignments):
                    field_name = assignment.split("=")[0].strip()
                    val = params[i]
                    if field_name in ("medical_conditions", "allergies"):
                        user[field_name] = _parse_json_field(val, [])
                    elif field_name in user:
                        user[field_name] = val
            user["updated_at"] = _now_iso()
            self.users[uid] = user
            return QueryResult(rows=[dict(user)], row_count=1)

        if trimmed.startswith("DELETE FROM users WHERE id = %s"):
            uid = str(params[0])
            existed = uid in self.users
            if existed:
                del self.users[uid]
                self.contacts = {
                    cid: c for cid, c in self.contacts.items() if c["user_id"] != uid
                }
                self.alerts = {
                    aid: a for aid, a in self.alerts.items() if a["user_id"] != uid
                }
            return QueryResult(rows=[{"id": uid}] if existed else [], row_count=1 if existed else 0)

        # ------------------------------------------------------------------
        # EMERGENCY CONTACTS
        # ------------------------------------------------------------------
        if trimmed.startswith("UPDATE emergency_contacts SET is_primary = FALSE WHERE user_id = %s"):
            user_id = str(params[0])
            exclude_id = str(params[1]) if len(params) > 1 else None
            for contact in self.contacts.values():
                if contact["user_id"] == user_id and (not exclude_id or contact["id"] != exclude_id):
                    contact["is_primary"] = False
            return QueryResult(rows=[], row_count=0)

        if trimmed.startswith("INSERT INTO emergency_contacts"):
            user_id, name, relationship, phone, email, is_primary, priority = params
            cid = str(uuid.uuid4())
            now = _now_iso()
            contact = {
                "id": cid,
                "user_id": str(user_id),
                "name": name,
                "relationship": relationship,
                "phone": phone,
                "email": email or None,
                "is_primary": bool(is_primary),
                "priority": int(priority) if priority is not None else 1,
                "created_at": now,
                "updated_at": now,
            }
            self.contacts[cid] = contact
            return QueryResult(rows=[dict(contact)], row_count=1)

        if trimmed.startswith("SELECT * FROM emergency_contacts WHERE id = %s"):
            contact = self.contacts.get(str(params[0]))
            return QueryResult(rows=[dict(contact)] if contact else [], row_count=1 if contact else 0)

        if "SELECT * FROM emergency_contacts" in trimmed and "WHERE user_id = %s" in trimmed:
            user_id = str(params[0])
            matching = sorted(
                (c for c in self.contacts.values() if c["user_id"] == user_id),
                key=lambda c: (c["priority"], c["created_at"]),
            )
            return QueryResult(rows=[dict(c) for c in matching], row_count=len(matching))

        if trimmed.startswith("UPDATE emergency_contacts"):
            cid = str(params[-1])
            contact = self.contacts.get(cid)
            if not contact:
                return QueryResult(rows=[], row_count=0)

            set_match = re.search(r"SET\s+(.*?)\s+WHERE", trimmed, re.DOTALL | re.IGNORECASE)
            if set_match:
                assignments = [a.strip() for a in set_match.group(1).split(",")]
                for i, assignment in enumerate(assignments):
                    field_name = assignment.split("=")[0].strip()
                    val = params[i]
                    if field_name == "is_primary":
                        contact["is_primary"] = bool(val)
                    elif field_name == "priority":
                        contact["priority"] = int(val)
                    elif field_name in contact:
                        contact[field_name] = val
            contact["updated_at"] = _now_iso()
            self.contacts[cid] = contact
            return QueryResult(rows=[dict(contact)], row_count=1)

        if trimmed.startswith("DELETE FROM emergency_contacts WHERE id = %s"):
            cid = str(params[0])
            existed = cid in self.contacts
            if existed:
                del self.contacts[cid]
            return QueryResult(rows=[{"id": cid}] if existed else [], row_count=1 if existed else 0)

        # ------------------------------------------------------------------
        # ALERTS
        # ------------------------------------------------------------------
        if trimmed.startswith("INSERT INTO alerts"):
            (
                user_id,
                alert_type,
                severity,
                status,
                location_coords,
                location_name,
                description,
                metadata,
            ) = params
            aid = str(uuid.uuid4())
            now = _now_iso()
            alert = {
                "id": aid,
                "user_id": str(user_id),
                "type": alert_type,
                "severity": severity or "medium",
                "status": status or "triggered",
                "location_coords": _parse_json_field(location_coords, None),
                "location_name": location_name or None,
                "description": description,
                "metadata": _parse_json_field(metadata, {}),
                "triggered_at": now,
                "acknowledged_at": None,
                "acknowledged_by": None,
                "resolved_at": None,
                "resolution_notes": None,
                "created_at": now,
                "updated_at": now,
            }
            self.alerts[aid] = alert
            return QueryResult(rows=[dict(alert)], row_count=1)

        if trimmed.startswith("SELECT * FROM alerts WHERE id = %s"):
            alert = self.alerts.get(str(params[0]))
            return QueryResult(rows=[dict(alert)] if alert else [], row_count=1 if alert else 0)

        if "SELECT COUNT(*) AS total FROM alerts" in trimmed:
            matching = list(self.alerts.values())
            idx = 0
            if "user_id = %s" in trimmed and idx < len(params):
                uid = str(params[idx])
                matching = [a for a in matching if a["user_id"] == uid]
                idx += 1
            if "status = %s" in trimmed and idx < len(params):
                st = params[idx]
                matching = [a for a in matching if a["status"] == st]
                idx += 1
            if "severity = %s" in trimmed and idx < len(params):
                sev = params[idx]
                matching = [a for a in matching if a["severity"] == sev]
                idx += 1
            return QueryResult(rows=[{"total": len(matching)}], row_count=1)

        if "SELECT * FROM alerts" in trimmed and "WHERE id = %s" not in trimmed:
            matching = sorted(
                self.alerts.values(),
                key=lambda a: a["triggered_at"],
                reverse=True,
            )
            idx = 0
            if "user_id = %s" in trimmed and idx < len(params):
                uid = str(params[idx])
                matching = [a for a in matching if a["user_id"] == uid]
                idx += 1
            if "status = %s" in trimmed and idx < len(params):
                st = params[idx]
                matching = [a for a in matching if a["status"] == st]
                idx += 1
            if "severity = %s" in trimmed and idx < len(params):
                sev = params[idx]
                matching = [a for a in matching if a["severity"] == sev]
                idx += 1
            limit = int(params[idx]) if idx < len(params) else 50
            offset = int(params[idx + 1]) if idx + 1 < len(params) else 0
            sliced = [dict(a) for a in matching[offset : offset + limit]]
            return QueryResult(rows=sliced, row_count=len(sliced))

        if "status = 'acknowledged'" in trimmed:
            by = params[0]
            aid = str(params[1])
            alert = self.alerts.get(aid)
            if not alert:
                return QueryResult(rows=[], row_count=0)
            now = _now_iso()
            alert["status"] = "acknowledged"
            alert["acknowledged_at"] = now
            alert["acknowledged_by"] = by
            alert["updated_at"] = now
            self.alerts[aid] = alert
            return QueryResult(rows=[dict(alert)], row_count=1)

        if "status = 'resolved'" in trimmed:
            notes = params[0]
            aid = str(params[1])
            alert = self.alerts.get(aid)
            if not alert:
                return QueryResult(rows=[], row_count=0)
            now = _now_iso()
            alert["status"] = "resolved"
            alert["resolved_at"] = now
            alert["resolution_notes"] = notes
            alert["updated_at"] = now
            self.alerts[aid] = alert
            return QueryResult(rows=[dict(alert)], row_count=1)

        if trimmed.startswith("DELETE FROM alerts WHERE id = %s"):
            aid = str(params[0])
            existed = aid in self.alerts
            if existed:
                del self.alerts[aid]
            return QueryResult(rows=[{"id": aid}] if existed else [], row_count=1 if existed else 0)

        return QueryResult(rows=[], row_count=0)
