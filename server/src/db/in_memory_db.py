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


ANJALI_USER_ID = "11111111-1111-4111-8111-111111111111"
RAMESH_USER_ID = "22222222-2222-4222-8222-222222222222"
DEFAULT_FAMILY_ID = "33333333-3333-4333-8333-333333333333"


class InMemoryDb:
    """Singleton in-memory database mirroring the PostgreSQL schema."""

    _instance: Optional["InMemoryDb"] = None

    def __init__(self) -> None:
        self.users: dict[str, dict[str, Any]] = {}
        self.contacts: dict[str, dict[str, Any]] = {}
        self.alerts: dict[str, dict[str, Any]] = {}
        self.families: dict[str, dict[str, Any]] = {}
        self.seed_demo_data()

    @classmethod
    def get_instance(cls) -> "InMemoryDb":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def reset(self, seed_demo: bool = True) -> None:
        self.users.clear()
        self.contacts.clear()
        self.alerts.clear()
        self.families.clear()
        if seed_demo:
            self.seed_demo_data()

    def seed_demo_data(self) -> None:
        """Idempotently seed demo users, emergency contacts, and default family."""
        seed_ts = "2026-08-01T00:00:00+00:00"

        if ANJALI_USER_ID not in self.users:
            self.users[ANJALI_USER_ID] = {
                "id": ANJALI_USER_ID,
                "name": "Anjali Sharma",
                "email": "anjali@kinguardian.com",
                "phone": "447123456789",
                "role": "coordinator",
                "blood_group": None,
                "medical_conditions": [],
                "allergies": [],
                "address": None,
                "city": "London",
                "country": "United Kingdom",
                "timezone": "Europe/London",
                "emergency_notes": "Primary diaspora caregiver coordinator for parents in Chennai.",
                "avatar_url": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
                "created_at": seed_ts,
                "updated_at": seed_ts,
            }

        if RAMESH_USER_ID not in self.users:
            self.users[RAMESH_USER_ID] = {
                "id": RAMESH_USER_ID,
                "name": "Ramesh Sharma",
                "email": "ramesh@kinguardian.com",
                "phone": "919270756299",
                "role": "parent",
                "blood_group": "B+",
                "medical_conditions": ["Hypertension", "Type 2 Diabetes"],
                "allergies": ["Penicillin"],
                "address": None,
                "city": "Chennai",
                "country": "India",
                "timezone": "Asia/Kolkata",
                "emergency_notes": "Hypertension history; on Amlodipine 5mg and Atorvastatin 20mg.",
                "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "created_at": seed_ts,
                "updated_at": seed_ts,
            }

        demo_contacts: list[dict[str, Any]] = [
            {
                "id": "10000000-0000-4000-8000-000000000001",
                "user_id": RAMESH_USER_ID,
                "name": "Priya",
                "relationship": "Family Caregiver",
                "phone": "+91 92707 56299",
                "email": "priya.care@kinguardian.com",
                "is_primary": True,
                "priority": 1,
                "created_at": seed_ts,
                "updated_at": seed_ts,
            },
            {
                "id": "10000000-0000-4000-8000-000000000002",
                "user_id": RAMESH_USER_ID,
                "name": "Anjali Sharma",
                "relationship": "Daughter / Coordinator",
                "phone": "+44 7123 456789",
                "email": "anjali@kinguardian.com",
                "is_primary": False,
                "priority": 2,
                "created_at": seed_ts,
                "updated_at": seed_ts,
            },
            {
                "id": "10000000-0000-4000-8000-000000000003",
                "user_id": RAMESH_USER_ID,
                "name": "Rahul Sharma",
                "relationship": "Son (Dubai)",
                "phone": "+971 50 123 4567",
                "email": "rahul@kinguardian.com",
                "is_primary": False,
                "priority": 3,
                "created_at": seed_ts,
                "updated_at": seed_ts,
            },
        ]
        for contact in demo_contacts:
            if contact["id"] not in self.contacts:
                self.contacts[contact["id"]] = contact

        if DEFAULT_FAMILY_ID not in self.families:
            self.families[DEFAULT_FAMILY_ID] = {
                "id": DEFAULT_FAMILY_ID,
                "name": "Sharma Family Care Circle",
                "primary_coordinator_profile_id": ANJALI_USER_ID,
                "created_at": seed_ts,
                "updated_at": seed_ts,
            }

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
            found_user = self.users.get(str(params[0]))
            return QueryResult(
                rows=[dict(found_user)] if found_user else [],
                row_count=1 if found_user else 0,
            )

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
            existing_user = self.users.get(uid)
            if not existing_user:
                return QueryResult(rows=[], row_count=0)

            set_match = re.search(r"SET\s+(.*?)\s+WHERE", trimmed, re.DOTALL | re.IGNORECASE)
            if set_match:
                assignments = [a.strip() for a in set_match.group(1).split(",")]
                pending_updates: dict[str, Any] = {}
                for i, assignment in enumerate(assignments):
                    field_name = assignment.split("=")[0].strip()
                    val = params[i]
                    if field_name == "email" and val is not None:
                        target_email = str(val).lower()
                        for other_id, other_user in self.users.items():
                            if other_id != uid and other_user["email"].lower() == target_email:
                                raise DatabaseError(
                                    'duplicate key value violates unique constraint "users_email_key"',
                                    code="23505",
                                )
                    if field_name in ("medical_conditions", "allergies"):
                        pending_updates[field_name] = _parse_json_field(val, [])
                    elif field_name in existing_user:
                        pending_updates[field_name] = val
                existing_user.update(pending_updates)
            existing_user["updated_at"] = _now_iso()
            self.users[uid] = existing_user
            return QueryResult(rows=[dict(existing_user)], row_count=1)

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
            found_contact = self.contacts.get(str(params[0]))
            return QueryResult(
                rows=[dict(found_contact)] if found_contact else [],
                row_count=1 if found_contact else 0,
            )

        if "SELECT * FROM emergency_contacts" in trimmed and "WHERE user_id = %s" in trimmed:
            user_id = str(params[0])
            matching = sorted(
                (c for c in self.contacts.values() if c["user_id"] == user_id),
                key=lambda c: (c["priority"], c["created_at"]),
            )
            return QueryResult(rows=[dict(c) for c in matching], row_count=len(matching))

        if trimmed.startswith("UPDATE emergency_contacts"):
            cid = str(params[-1])
            existing_contact = self.contacts.get(cid)
            if not existing_contact:
                return QueryResult(rows=[], row_count=0)

            set_match = re.search(r"SET\s+(.*?)\s+WHERE", trimmed, re.DOTALL | re.IGNORECASE)
            if set_match:
                assignments = [a.strip() for a in set_match.group(1).split(",")]
                for i, assignment in enumerate(assignments):
                    field_name = assignment.split("=")[0].strip()
                    val = params[i]
                    if field_name == "is_primary":
                        existing_contact["is_primary"] = bool(val)
                    elif field_name == "priority":
                        existing_contact["priority"] = int(val)
                    elif field_name in existing_contact:
                        existing_contact[field_name] = val
            existing_contact["updated_at"] = _now_iso()
            self.contacts[cid] = existing_contact
            return QueryResult(rows=[dict(existing_contact)], row_count=1)

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
            found_alert = self.alerts.get(str(params[0]))
            return QueryResult(
                rows=[dict(found_alert)] if found_alert else [],
                row_count=1 if found_alert else 0,
            )

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
            ack_alert = self.alerts.get(aid)
            if not ack_alert:
                return QueryResult(rows=[], row_count=0)
            now = _now_iso()
            ack_alert["status"] = "acknowledged"
            ack_alert["acknowledged_at"] = now
            ack_alert["acknowledged_by"] = by
            ack_alert["updated_at"] = now
            self.alerts[aid] = ack_alert
            return QueryResult(rows=[dict(ack_alert)], row_count=1)

        if "status = 'resolved'" in trimmed:
            notes = params[0]
            aid = str(params[1])
            res_alert = self.alerts.get(aid)
            if not res_alert:
                return QueryResult(rows=[], row_count=0)
            now = _now_iso()
            res_alert["status"] = "resolved"
            res_alert["resolved_at"] = now
            res_alert["resolution_notes"] = notes
            res_alert["updated_at"] = now
            self.alerts[aid] = res_alert
            return QueryResult(rows=[dict(res_alert)], row_count=1)

        if trimmed.startswith("DELETE FROM alerts WHERE id = %s"):
            aid = str(params[0])
            existed = aid in self.alerts
            if existed:
                del self.alerts[aid]
            return QueryResult(rows=[{"id": aid}] if existed else [], row_count=1 if existed else 0)

        return QueryResult(rows=[], row_count=0)
