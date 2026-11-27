"""Comprehensive integration test suite for KinGuardian Python Backend."""

from __future__ import annotations

import time
import uuid
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from src.app import app
from src.db.in_memory_db import InMemoryDb
from src.db.pool import enable_in_memory_fallback
from whatsapp_webhook_server import CONFIG as WHATSAPP_CONFIG
from whatsapp_webhook_server import app as whatsapp_app


@pytest.fixture(scope="module")
def client() -> Iterator[TestClient]:
    InMemoryDb.get_instance().reset()
    enable_in_memory_fallback()
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def wa_client() -> Iterator[TestClient]:
    with TestClient(whatsapp_app) as c:
        yield c


# ---------------------------------------------------------------------------
# Health Check Endpoints
# ---------------------------------------------------------------------------
def test_health_endpoint(client: TestClient) -> None:
    res = client.get("/health")
    assert res.status_code == 200
    body = res.json()
    assert body["status"] == "ok"
    assert "uptime" in body
    assert "timestamp" in body
    assert body["database"] in ("connected", "disconnected")


def test_health_ready_endpoint(client: TestClient) -> None:
    res = client.get("/health/ready")
    assert res.status_code in (200, 503)
    body = res.json()
    if res.status_code == 200:
        assert body["status"] == "ready"
        assert body["database"] == "connected"
    else:
        assert body["status"] == "not_ready"


def test_x_request_id_header(client: TestClient) -> None:
    custom_id = str(uuid.uuid4())
    res = client.get("/health", headers={"X-Request-ID": custom_id})
    assert res.headers.get("x-request-id") == custom_id


# ---------------------------------------------------------------------------
# User Profiles API (/api/v1/users)
# ---------------------------------------------------------------------------
def test_users_crud_flow(client: TestClient) -> None:
    # 1. Validation error on empty payload
    bad_res = client.post("/api/v1/users", json={})
    assert bad_res.status_code == 400
    assert bad_res.json()["success"] is False
    assert bad_res.json()["error"]["code"] == "VALIDATION_ERROR"

    # 2. Create user
    email = f"ramesh_{int(time.time() * 1000)}@kinguardian.test"
    payload = {
        "name": "Ramesh Sharma",
        "email": email,
        "phone": "+919876543210",
        "role": "parent",
        "blood_group": "B+",
        "medical_conditions": ["Hypertension", "Type 2 Diabetes"],
        "allergies": ["Penicillin"],
        "city": "Chennai",
        "country": "India",
        "timezone": "Asia/Kolkata",
        "emergency_notes": "Prefers Apollo Hospital Greams Road.",
    }
    create_res = client.post("/api/v1/users", json=payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["success"] is True
    user_id = created["data"]["id"]
    assert created["data"]["name"] == "Ramesh Sharma"
    assert created["data"]["email"] == email
    assert created["data"]["blood_group"] == "B+"

    # 3. Duplicate email -> 409 CONFLICT
    dup_res = client.post(
        "/api/v1/users",
        json={"name": "Duplicate Ramesh", "email": email, "role": "parent"},
    )
    assert dup_res.status_code == 409
    assert dup_res.json()["success"] is False
    assert dup_res.json()["error"]["code"] == "CONFLICT"

    # 4. Get by ID
    get_res = client.get(f"/api/v1/users/{user_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["id"] == user_id
    assert get_res.json()["data"]["city"] == "Chennai"

    # 5. Non-UUID -> 400 VALIDATION_ERROR
    invalid_res = client.get("/api/v1/users/invalid-uuid")
    assert invalid_res.status_code == 400
    assert invalid_res.json()["error"]["code"] == "VALIDATION_ERROR"

    # 6. Unknown UUID -> 404 NOT_FOUND
    missing_res = client.get(f"/api/v1/users/{uuid.uuid4()}")
    assert missing_res.status_code == 404
    assert missing_res.json()["error"]["code"] == "NOT_FOUND"

    # 7. List users
    list_res = client.get("/api/v1/users")
    assert list_res.status_code == 200
    assert list_res.json()["success"] is True
    assert isinstance(list_res.json()["data"], list)
    assert len(list_res.json()["data"]) >= 1

    # 8. Update user
    patch_res = client.patch(
        f"/api/v1/users/{user_id}",
        json={
            "city": "Bengaluru",
            "medical_conditions": ["Hypertension", "Type 2 Diabetes", "Mild Arthritis"],
        },
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["city"] == "Bengaluru"


# ---------------------------------------------------------------------------
# Emergency Contacts API (/api/v1/users/:userId/contacts & /api/v1/contacts)
# ---------------------------------------------------------------------------
def test_contacts_crud_flow(client: TestClient) -> None:
    u_res = client.post(
        "/api/v1/users",
        json={
            "name": "Parent for Contacts",
            "email": f"parent_contacts_{int(time.time() * 1000)}@kinguardian.test",
            "role": "parent",
        },
    )
    assert u_res.status_code == 201
    user_id = u_res.json()["data"]["id"]

    c1_res = client.post(
        f"/api/v1/users/{user_id}/contacts",
        json={
            "name": "Anjali Sharma",
            "relationship": "Daughter",
            "phone": "+447911123456",
            "email": "anjali@london.test",
            "is_primary": True,
            "priority": 1,
        },
    )
    assert c1_res.status_code == 201
    c1_id = c1_res.json()["data"]["id"]
    assert c1_res.json()["data"]["is_primary"] is True

    c2_res = client.post(
        f"/api/v1/users/{user_id}/contacts",
        json={
            "name": "Rahul Sharma",
            "relationship": "Son",
            "phone": "+919812345678",
            "is_primary": False,
            "priority": 2,
        },
    )
    assert c2_res.status_code == 201
    c2_id = c2_res.json()["data"]["id"]

    list_res = client.get(f"/api/v1/users/{user_id}/contacts")
    assert list_res.status_code == 200
    contacts = list_res.json()["data"]
    assert len(contacts) == 2
    assert contacts[0]["priority"] == 1
    assert contacts[1]["priority"] == 2

    get_res = client.get(f"/api/v1/contacts/{c1_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["name"] == "Anjali Sharma"

    patch_res = client.patch(
        f"/api/v1/contacts/{c1_id}", json={"phone": "+447999888777"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["phone"] == "+447999888777"

    del_res = client.delete(f"/api/v1/contacts/{c2_id}")
    assert del_res.status_code == 204

    check_res = client.get(f"/api/v1/contacts/{c2_id}")
    assert check_res.status_code == 404


# ---------------------------------------------------------------------------
# Alerts & Incidents API (/api/v1/alerts)
# ---------------------------------------------------------------------------
def test_alerts_flow(client: TestClient) -> None:
    u_res = client.post(
        "/api/v1/users",
        json={
            "name": "Parent for Alerts",
            "email": f"parent_alerts_{int(time.time() * 1000)}@kinguardian.test",
            "role": "parent",
        },
    )
    assert u_res.status_code == 201
    user_id = u_res.json()["data"]["id"]

    create_res = client.post(
        "/api/v1/alerts",
        json={
            "userId": user_id,
            "type": "sos_panic",
            "severity": "critical",
            "description": "SOS button pressed in bedroom. High heart rate spike detected.",
            "location_coords": {"latitude": 13.0827, "longitude": 80.2707, "accuracy": 10},
            "location_name": "Home - Anna Nagar, Chennai",
            "metadata": {"heart_rate": 135, "bp": "165/105"},
        },
    )
    assert create_res.status_code == 201
    alert_data = create_res.json()["data"]
    alert_id = alert_data["id"]
    assert alert_data["status"] == "triggered"
    assert alert_data["severity"] == "critical"

    list_res = client.get("/api/v1/alerts")
    assert list_res.status_code == 200
    assert any(a["id"] == alert_id for a in list_res.json()["data"])

    get_res = client.get(f"/api/v1/alerts/{alert_id}")
    assert get_res.status_code == 200
    assert get_res.json()["data"]["type"] == "sos_panic"

    ack_res = client.patch(
        f"/api/v1/alerts/{alert_id}/acknowledge",
        json={"acknowledged_by": "Anjali (London Coordinator)"},
    )
    assert ack_res.status_code == 200
    assert ack_res.json()["data"]["status"] == "acknowledged"
    assert ack_res.json()["data"]["acknowledged_by"] == "Anjali (London Coordinator)"
    assert ack_res.json()["data"]["acknowledged_at"] is not None

    res_res = client.patch(
        f"/api/v1/alerts/{alert_id}/resolve",
        json={"resolution_notes": "Spoke via video call. False alarm, phone dropped on floor."},
    )
    assert res_res.status_code == 200
    assert res_res.json()["data"]["status"] == "resolved"
    assert "False alarm" in res_res.json()["data"]["resolution_notes"]
    assert res_res.json()["data"]["resolved_at"] is not None


# ---------------------------------------------------------------------------
# Cascade Delete Flow
# ---------------------------------------------------------------------------
def test_cascade_delete_user(client: TestClient) -> None:
    u_res = client.post(
        "/api/v1/users",
        json={
            "name": "User to Delete",
            "email": f"delete_{int(time.time() * 1000)}@kinguardian.test",
            "role": "parent",
        },
    )
    u_id = u_res.json()["data"]["id"]

    del_res = client.delete(f"/api/v1/users/{u_id}")
    assert del_res.status_code == 204

    check_res = client.get(f"/api/v1/users/{u_id}")
    assert check_res.status_code == 404


# ---------------------------------------------------------------------------
# AI Clinical Query API (/api/v1/ai/ask)
# ---------------------------------------------------------------------------
def test_ai_ask_endpoint(client: TestClient) -> None:
    res = client.post(
        "/api/v1/ai/ask",
        json={
            "query": "What is Dad's blood pressure?",
            "patientName": "Ramesh (Dad)",
            "currentBP": "132/84 mmHg",
        },
    )
    assert res.status_code == 200
    data = res.json()["data"]
    assert "Ramesh" in data["answer"]
    assert "132/84 mmHg" in data["answer"]
    assert len(data["citations"]) >= 1
    assert len(data["suggestedFollowUps"]) >= 1


# ---------------------------------------------------------------------------
# WhatsApp Webhook Server
# ---------------------------------------------------------------------------
def test_whatsapp_webhook_verification_and_health(wa_client: TestClient) -> None:
    ping = wa_client.get("/webhook")
    assert ping.status_code == 200
    assert "Online" in ping.text

    previous_token = WHATSAPP_CONFIG.WEBHOOK_VERIFY_TOKEN
    WHATSAPP_CONFIG.WEBHOOK_VERIFY_TOKEN = "kinguardian_verify_secret_2026"
    try:
        verify = wa_client.get(
            "/webhook",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "kinguardian_verify_secret_2026",
                "hub.challenge": "123456789",
            },
        )
        assert verify.status_code == 200
        assert verify.text == "123456789"
    finally:
        WHATSAPP_CONFIG.WEBHOOK_VERIFY_TOKEN = previous_token

    health = wa_client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ONLINE"
