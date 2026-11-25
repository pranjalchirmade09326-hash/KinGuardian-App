"""Pydantic schemas and domain types for KinGuardian API."""

from __future__ import annotations

import re
from typing import Annotated, Any, Literal, Optional
from pydantic import AfterValidator, BaseModel, Field

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _validate_email(value: str) -> str:
    if not _EMAIL_RE.match(value):
        raise ValueError("Invalid email address")
    return value


EmailStr = Annotated[str, AfterValidator(_validate_email)]

UserRole = Literal["coordinator", "parent", "caregiver", "doctor"]

BloodGroup = Literal[
    "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"
]

AlertType = Literal[
    "fall_detected",
    "fall_detection",
    "sos",
    "sos_panic",
    "vital_spike",
    "bp_spike",
    "unwell_checkin",
    "heart_rate_abnormal",
    "medication_missed",
    "geofence_exit",
    "general_emergency",
]

AlertSeverity = Literal["critical", "high", "medium", "low", "info"]

AlertStatus = Literal[
    "triggered", "acknowledged", "dispatched", "resolved", "false_alarm"
]


class LocationCoords(BaseModel):
    latitude: float
    longitude: float
    accuracy: Optional[float] = None


# ---------------------------------------------------------------------------
# User Schemas
# ---------------------------------------------------------------------------
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=50)
    role: UserRole = "parent"
    blood_group: Optional[BloodGroup] = None
    medical_conditions: list[Any] = Field(default_factory=list)
    allergies: list[Any] = Field(default_factory=list)
    address: Optional[str] = None
    city: Optional[str] = Field(default=None, max_length=100)
    country: Optional[str] = Field(default=None, max_length=100)
    timezone: Optional[str] = Field(default=None, max_length=50)
    emergency_notes: Optional[str] = None
    avatar_url: Optional[str] = None


class UserUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    phone: Optional[str] = Field(default=None, max_length=50)
    role: Optional[UserRole] = None
    blood_group: Optional[BloodGroup] = None
    medical_conditions: Optional[list[Any]] = None
    allergies: Optional[list[Any]] = None
    address: Optional[str] = None
    city: Optional[str] = Field(default=None, max_length=100)
    country: Optional[str] = Field(default=None, max_length=100)
    timezone: Optional[str] = Field(default=None, max_length=50)
    emergency_notes: Optional[str] = None
    avatar_url: Optional[str] = None


# ---------------------------------------------------------------------------
# Emergency Contact Schemas
# ---------------------------------------------------------------------------
class ContactCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    relationship: str = Field(..., min_length=1, max_length=100)
    phone: str = Field(..., min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    is_primary: bool = False
    priority: int = Field(default=1, ge=0)


class ContactUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=255)
    relationship: Optional[str] = Field(default=None, min_length=1, max_length=100)
    phone: Optional[str] = Field(default=None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    is_primary: Optional[bool] = None
    priority: Optional[int] = Field(default=None, ge=0)


# ---------------------------------------------------------------------------
# Alert Schemas
# ---------------------------------------------------------------------------
class AlertCreate(BaseModel):
    userId: str
    type: AlertType
    severity: AlertSeverity = "medium"
    description: str = Field(..., min_length=1)
    location_coords: Optional[LocationCoords] = None
    location_name: Optional[str] = Field(default=None, max_length=255)
    metadata: dict[str, Any] = Field(default_factory=dict)
    status: AlertStatus = "triggered"


class AlertAcknowledge(BaseModel):
    acknowledged_by: str = Field(..., min_length=1)


class AlertResolve(BaseModel):
    resolution_notes: str = Field(..., min_length=1)


# ---------------------------------------------------------------------------
# AI Schemas
# ---------------------------------------------------------------------------
class AskAiRequest(BaseModel):
    query: str = Field(..., min_length=1)
    patientName: str = "Ramesh"
    currentBP: str = "138/88 mmHg"
