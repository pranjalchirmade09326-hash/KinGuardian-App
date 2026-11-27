"""SRD Care Domain Routes: families, care_subjects, check-ins, adherence, consents, tasks, audit."""

from __future__ import annotations

import json
from typing import Any, Literal, Optional
from uuid import UUID

from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from src.db.pool import query
from src.middleware.errors import AppError

care_router = APIRouter(tags=["Care Domain"])


class FamilyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    primary_coordinator_profile_id: Optional[str] = None


class SubjectCreate(BaseModel):
    family_id: Optional[str] = None
    name: str = Field(..., min_length=1, max_length=255)
    relationship: str = Field(default="Parent", max_length=100)
    age: int = Field(default=65, ge=1, le=120)
    city: str = Field(default="Chennai", max_length=100)
    country: str = Field(default="India", max_length=100)
    timezone: str = Field(default="Asia/Kolkata", max_length=50)
    phone: Optional[str] = None
    fhir_patient_id: Optional[str] = None


class CheckInCreate(BaseModel):
    feeling: Literal["good", "okay", "not_well"]
    note: Optional[str] = None
    actor_id: Optional[str] = None


class MedicationAdherenceCreate(BaseModel):
    medication_name: str = Field(..., min_length=1, max_length=255)
    dose: Optional[str] = None
    scheduled_time: Optional[str] = None
    status: Literal["scheduled", "due", "taken", "missed"] = "taken"
    confirmed_by: Optional[str] = None
    idempotency_key: Optional[str] = None


class ConsentCreate(BaseModel):
    subject_id: str
    grantor_user_id: Optional[str] = None
    grantee_user_id: Optional[str] = None
    scope: str = Field(..., min_length=1, max_length=100)


class CareTaskCreate(BaseModel):
    family_id: Optional[str] = None
    subject_id: Optional[str] = None
    title: str = Field(..., min_length=1, max_length=255)
    assigned_to: Optional[str] = None
    priority: Literal["low", "medium", "high"] = "medium"
    due_at: Optional[str] = None


class WearableSyncCreate(BaseModel):
    provider: str = Field(default="Google Fit (Health Connect)", max_length=100)
    steps: int = Field(default=0, ge=0)
    bp: str = Field(default="120/80", max_length=30)
    sleep_hours: float = Field(default=7.5, ge=0)
    heart_rate: int = Field(default=72, ge=0)


async def _record_event_and_audit(
    event_type: str,
    aggregate_type: str,
    aggregate_id: str,
    payload: dict[str, Any],
    actor_id: Optional[str],
    action: str,
) -> None:
    await query(
        """
        INSERT INTO outbox_events (event_type, aggregate_type, aggregate_id, payload)
        VALUES (%s, %s, %s, %s);
        """,
        [event_type, aggregate_type, aggregate_id, json.dumps(payload)],
    )
    await query(
        """
        INSERT INTO audit_log (actor_id, action, resource_type, resource_id, metadata)
        VALUES (%s, %s, %s, %s, %s);
        """,
        [actor_id, action, aggregate_type, aggregate_id, json.dumps({"event_type": event_type})],
    )


# --- Families ---
@care_router.post("/families", status_code=status.HTTP_201_CREATED)
async def create_family(payload: FamilyCreate) -> dict:
    res = await query(
        """
        INSERT INTO families (name, primary_coordinator_profile_id)
        VALUES (%s, %s)
        RETURNING *;
        """,
        [payload.name, payload.primary_coordinator_profile_id],
    )
    fam = res.rows[0]
    await _record_event_and_audit(
        "family.created",
        "family",
        str(fam["id"]),
        {"name": fam["name"]},
        payload.primary_coordinator_profile_id,
        "create_family",
    )
    return {"success": True, "data": fam}


@care_router.get("/families")
async def list_families() -> dict:
    res = await query("SELECT * FROM families ORDER BY created_at DESC LIMIT 50;")
    return {"success": True, "data": res.rows}


# --- Care Subjects (Parents) ---
@care_router.post("/subjects", status_code=status.HTTP_201_CREATED)
async def create_subject(payload: SubjectCreate) -> dict:
    res = await query(
        """
        INSERT INTO care_subjects (
            family_id, name, relationship, age, city, country, timezone, phone, fhir_patient_id
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING *;
        """,
        [
            payload.family_id,
            payload.name,
            payload.relationship,
            payload.age,
            payload.city,
            payload.country,
            payload.timezone,
            payload.phone,
            payload.fhir_patient_id,
        ],
    )
    subj = res.rows[0]
    await _record_event_and_audit(
        "subject.added",
        "care_subject",
        str(subj["id"]),
        {"name": subj["name"], "relationship": subj["relationship"]},
        None,
        "create_subject",
    )
    return {"success": True, "data": subj}


@care_router.get("/subjects")
async def list_subjects(family_id: Optional[UUID] = None) -> dict:
    if family_id:
        res = await query(
            "SELECT * FROM care_subjects WHERE family_id = %s ORDER BY created_at DESC;",
            [str(family_id)],
        )
    else:
        res = await query("SELECT * FROM care_subjects ORDER BY created_at DESC LIMIT 50;")
    return {"success": True, "data": res.rows}


# --- Wellbeing Check-ins ---
@care_router.post("/subjects/{subject_id}/check-ins", status_code=status.HTTP_201_CREATED)
async def create_checkin(subject_id: UUID, payload: CheckInCreate) -> dict:
    res = await query(
        """
        INSERT INTO wellbeing_checkins (subject_id, feeling, note)
        VALUES (%s, %s, %s)
        RETURNING *;
        """,
        [str(subject_id), payload.feeling, payload.note],
    )
    checkin = res.rows[0]
    await _record_event_and_audit(
        "parent.checkin.submitted",
        "wellbeing_checkin",
        str(checkin["id"]),
        {"subject_id": str(subject_id), "feeling": payload.feeling},
        payload.actor_id or str(subject_id),
        "submit_checkin",
    )
    return {"success": True, "data": checkin}


@care_router.get("/subjects/{subject_id}/check-ins")
async def list_checkins(subject_id: UUID) -> dict:
    res = await query(
        "SELECT * FROM wellbeing_checkins WHERE subject_id = %s ORDER BY recorded_at DESC LIMIT 50;",
        [str(subject_id)],
    )
    return {"success": True, "data": res.rows}


# --- Medication Adherence (Idempotent) ---
@care_router.post("/subjects/{subject_id}/medications/adherence", status_code=status.HTTP_201_CREATED)
async def record_medication_adherence(
    subject_id: UUID, payload: MedicationAdherenceCreate
) -> dict:
    if payload.idempotency_key:
        existing = await query(
            "SELECT * FROM medication_adherence WHERE idempotency_key = %s;",
            [payload.idempotency_key],
        )
        if existing.rows:
            return {"success": True, "data": existing.rows[0], "idempotent_replay": True}

    res = await query(
        """
        INSERT INTO medication_adherence (
            subject_id, medication_name, dose, scheduled_time, status, confirmed_by, idempotency_key
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
        RETURNING *;
        """,
        [
            str(subject_id),
            payload.medication_name,
            payload.dose,
            payload.scheduled_time,
            payload.status,
            payload.confirmed_by,
            payload.idempotency_key,
        ],
    )
    record = res.rows[0]
    await _record_event_and_audit(
        f"medication.{payload.status}",
        "medication_adherence",
        str(record["id"]),
        {"subject_id": str(subject_id), "medication": payload.medication_name},
        payload.confirmed_by,
        "record_medication_adherence",
    )
    return {"success": True, "data": record}


@care_router.get("/subjects/{subject_id}/medications/adherence")
async def list_medication_adherence(subject_id: UUID) -> dict:
    res = await query(
        "SELECT * FROM medication_adherence WHERE subject_id = %s ORDER BY confirmed_at DESC LIMIT 50;",
        [str(subject_id)],
    )
    return {"success": True, "data": res.rows}


# --- Consent & Revocation ---
@care_router.post("/consents", status_code=status.HTTP_201_CREATED)
async def grant_consent(payload: ConsentCreate) -> dict:
    res = await query(
        """
        INSERT INTO consents (subject_id, grantor_user_id, grantee_user_id, scope, status)
        VALUES (%s, %s, %s, %s, 'active')
        RETURNING *;
        """,
        [payload.subject_id, payload.grantor_user_id, payload.grantee_user_id, payload.scope],
    )
    consent = res.rows[0]
    await _record_event_and_audit(
        "consent.granted",
        "consent",
        str(consent["id"]),
        {"scope": payload.scope, "subject_id": payload.subject_id},
        payload.grantor_user_id,
        "grant_consent",
    )
    return {"success": True, "data": consent}


@care_router.post("/consents/{consent_id}/revoke")
async def revoke_consent(consent_id: UUID) -> dict:
    res = await query(
        """
        UPDATE consents
        SET status = 'revoked', revoked_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING *;
        """,
        [str(consent_id)],
    )
    if not res.rows:
        raise AppError(404, "NOT_FOUND", f"Consent {consent_id} not found.")
    consent = res.rows[0]
    await _record_event_and_audit(
        "consent.revoked",
        "consent",
        str(consent_id),
        {"scope": consent["scope"], "subject_id": str(consent["subject_id"])},
        str(consent.get("grantor_user_id") or ""),
        "revoke_consent",
    )
    return {"success": True, "data": consent}


@care_router.get("/consents")
async def list_consents(subject_id: Optional[UUID] = None) -> dict:
    if subject_id:
        res = await query(
            "SELECT * FROM consents WHERE subject_id = %s ORDER BY granted_at DESC;",
            [str(subject_id)],
        )
    else:
        res = await query("SELECT * FROM consents ORDER BY granted_at DESC LIMIT 50;")
    return {"success": True, "data": res.rows}


# --- Care Tasks ---
@care_router.post("/care/tasks", status_code=status.HTTP_201_CREATED)
async def create_care_task(payload: CareTaskCreate) -> dict:
    res = await query(
        """
        INSERT INTO care_tasks (family_id, subject_id, title, assigned_to, priority, due_at)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING *;
        """,
        [
            payload.family_id,
            payload.subject_id,
            payload.title,
            payload.assigned_to,
            payload.priority,
            payload.due_at,
        ],
    )
    task = res.rows[0]
    await _record_event_and_audit(
        "care.task.assigned",
        "care_task",
        str(task["id"]),
        {"title": task["title"], "assigned_to": task["assigned_to"]},
        None,
        "create_care_task",
    )
    return {"success": True, "data": task}


@care_router.get("/care/tasks")
async def list_care_tasks(family_id: Optional[UUID] = None) -> dict:
    if family_id:
        res = await query(
            "SELECT * FROM care_tasks WHERE family_id = %s ORDER BY created_at DESC;",
            [str(family_id)],
        )
    else:
        res = await query("SELECT * FROM care_tasks ORDER BY created_at DESC LIMIT 50;")
    return {"success": True, "data": res.rows}


@care_router.patch("/care/tasks/{task_id}/complete")
async def complete_care_task(task_id: UUID) -> dict:
    res = await query(
        """
        UPDATE care_tasks
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP
        WHERE id = %s
        RETURNING *;
        """,
        [str(task_id)],
    )
    if not res.rows:
        raise AppError(404, "NOT_FOUND", f"Care task {task_id} not found.")
    task = res.rows[0]
    await _record_event_and_audit(
        "care.task.completed",
        "care_task",
        str(task_id),
        {"title": task["title"]},
        task.get("assigned_to"),
        "complete_care_task",
    )
    return {"success": True, "data": task}


# --- Audit Log ---
@care_router.get("/audit")
async def list_audit_events() -> dict:
    res = await query("SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 50;")
    return {"success": True, "data": res.rows}


# --- Wearable Live Telemetry (Google Fit / Health Connect) ---
@care_router.post("/subjects/{subject_id}/wearables/sync", status_code=status.HTTP_201_CREATED)
async def sync_wearable_telemetry(subject_id: UUID, payload: WearableSyncCreate) -> dict:
    res = await query(
        """
        INSERT INTO wearable_telemetry (subject_id, provider, steps, bp, sleep_hours, heart_rate)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING *;
        """,
        [
            str(subject_id),
            payload.provider,
            payload.steps,
            payload.bp,
            payload.sleep_hours,
            payload.heart_rate,
        ],
    )
    row = res.rows[0]
    await _record_event_and_audit(
        "wearable.sync.completed",
        "wearable_telemetry",
        str(row["id"]),
        {"provider": payload.provider, "steps": payload.steps, "heart_rate": payload.heart_rate},
        str(subject_id),
        "sync_wearable_telemetry",
    )
    return {"success": True, "data": row}


@care_router.get("/subjects/{subject_id}/wearables/latest")
async def get_latest_wearable_telemetry(subject_id: UUID) -> dict:
    res = await query(
        "SELECT * FROM wearable_telemetry WHERE subject_id = %s ORDER BY synced_at DESC LIMIT 1;",
        [str(subject_id)],
    )
    return {"success": True, "data": res.rows[0] if res.rows else None}
