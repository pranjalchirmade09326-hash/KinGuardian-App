"""Live E2E Functional & PostgreSQL Integration Test Suite for KinGuardian."""

import json
import urllib.request
import uuid

BASE = "http://localhost:4000"


def request(method: str, path: str, body: dict | None = None) -> tuple[int, dict | None]:
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"} if body is not None else {}
    req = urllib.request.Request(f"{BASE}{path}", data=data, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=10) as resp:
        raw = resp.read().decode("utf-8")
        return resp.status, (json.loads(raw) if raw else None)


def main() -> None:
    # Cleanup leftover test users from earlier aborted runs if present
    for stale_id in ("202a6a25-303b-48b3-8c98-a3392753a1b7", "ba329543-c136-482c-9f84-64514409ee7c"):
        try:
            request("DELETE", f"/api/v1/users/{stale_id}")
        except Exception:
            pass

    # 1. Health & PostgreSQL DB connection
    status, h = request("GET", "/health")
    assert status == 200 and h and h["status"] == "ok" and h["database"] == "connected", h
    print(f"PASS [HEALTH]: database={h['database']}, latency={h['db_latency_ms']}ms")

    # 2. User Registration -> PostgreSQL users table
    email = f"e2e_{uuid.uuid4().hex[:8]}@kinguardian.com"
    status, u = request(
        "POST",
        "/api/v1/users",
        {
            "name": "Test Parent E2E",
            "email": email,
            "role": "parent",
            "city": "Pune",
            "country": "India",
            "phone": "+91 9800000001",
        },
    )
    assert status in (200, 201) and u and u["success"] and u["data"]["email"] == email, u
    uid = u["data"]["id"]
    _, fetched = request("GET", f"/api/v1/users/{uid}")
    assert fetched and fetched["data"]["id"] == uid, fetched
    print(f"PASS [USER CREATE & READ -> DB]: {uid}")

    # 3. Emergency Contact -> PostgreSQL emergency_contacts table
    status, c = request(
        "POST",
        f"/api/v1/users/{uid}/contacts",
        {
            "name": "Test Coordinator",
            "relationship": "Son",
            "phone": "+44 7700000001",
            "is_primary": True,
            "priority": 1,
        },
    )
    assert status in (200, 201) and c and c["success"] and c["data"]["user_id"] == uid, c
    cid = c["data"]["id"]
    _, contacts_list = request("GET", f"/api/v1/users/{uid}/contacts")
    assert contacts_list and any(x["id"] == cid for x in contacts_list["data"]), contacts_list
    print(f"PASS [CONTACT CREATE & LIST -> DB]: {cid}")

    # 4. Alert Lifecycle (Trigger -> Acknowledge -> Resolve) -> PostgreSQL alerts table
    status, a = request(
        "POST",
        "/api/v1/alerts",
        {
            "userId": uid,
            "type": "bp_spike",
            "severity": "high",
            "description": "E2E BP Spike 145/92",
        },
    )
    assert status in (200, 201) and a and a["success"] and a["data"]["status"] == "triggered", a
    aid = a["data"]["id"]
    _, ack = request("PATCH", f"/api/v1/alerts/{aid}/acknowledge", {"acknowledged_by": "Ram Atale"})
    assert ack and ack["data"]["status"] == "acknowledged", ack
    _, res = request("PATCH", f"/api/v1/alerts/{aid}/resolve", {"resolution_notes": "Verified normal"})
    assert res and res["data"]["status"] == "resolved", res
    print(f"PASS [ALERT CREATE/ACK/RESOLVE -> DB]: {aid}")

    # 5. Ask AI (/api/v1/ai/ask) -> Clean formatting & dynamic dates
    status, ai = request(
        "POST",
        "/api/v1/ai/ask",
        {
            "query": "Latest blood test report",
            "patientName": "Aniruddha",
            "currentBP": "122/80 mmHg",
        },
    )
    assert status == 200 and ai and ai["success"], ai
    ans = ai["data"]["answer"]
    assert "**" not in ans and "August 3, 2026" not in ans, ans
    print(f"PASS [AI /ask CLEAN & DYNAMIC]: {ans.splitlines()[0]}")

    # 6. SRD Care Domain: Family -> Subject -> Check-in -> Med Adherence (idempotent) -> Consent/Revoke -> Care Task -> Audit
    _, fam = request("POST", "/api/v1/families", {"name": "E2E Atale Family", "primary_coordinator_profile_id": uid})
    assert fam and fam["success"], fam
    fid = fam["data"]["id"]

    _, subj = request("POST", "/api/v1/subjects", {"family_id": fid, "name": "Aniruddha E2E", "relationship": "Father", "city": "Pune"})
    assert subj and subj["success"], subj
    sid = subj["data"]["id"]

    _, chk = request("POST", f"/api/v1/subjects/{sid}/check-ins", {"feeling": "good", "note": "Morning walk done"})
    assert chk and chk["data"]["feeling"] == "good", chk

    idem_key = f"med-{uuid.uuid4().hex[:8]}"
    _, med1 = request("POST", f"/api/v1/subjects/{sid}/medications/adherence", {"medication_name": "Amlodipine", "dose": "5mg", "status": "taken", "idempotency_key": idem_key})
    _, med2 = request("POST", f"/api/v1/subjects/{sid}/medications/adherence", {"medication_name": "Amlodipine", "dose": "5mg", "status": "taken", "idempotency_key": idem_key})
    assert med1 and med2 and med2.get("idempotent_replay") is True and med1["data"]["id"] == med2["data"]["id"], (med1, med2)

    _, con = request("POST", "/api/v1/consents", {"subject_id": sid, "grantor_user_id": uid, "scope": "view_medications"})
    assert con and con["data"]["status"] == "active", con
    _, rev = request("POST", f"/api/v1/consents/{con['data']['id']}/revoke")
    assert rev and rev["data"]["status"] == "revoked", rev

    _, task = request("POST", "/api/v1/care/tasks", {"family_id": fid, "subject_id": sid, "title": "Pick up lab report", "assigned_to": "Priya"})
    assert task and task["data"]["status"] == "pending", task
    _, comp = request("PATCH", f"/api/v1/care/tasks/{task['data']['id']}/complete")
    assert comp and comp["data"]["status"] == "completed", comp

    _, audit = request("GET", "/api/v1/audit")
    assert audit and len(audit["data"]) > 0, audit

    _, w_sync = request("POST", f"/api/v1/subjects/{sid}/wearables/sync", {"provider": "Google Fit (Health Connect)", "steps": 5120, "bp": "120/80", "sleep_hours": 7.5, "heart_rate": 72})
    assert w_sync and w_sync["data"]["steps"] == 5120 and w_sync["data"]["heart_rate"] == 72, w_sync
    _, w_latest = request("GET", f"/api/v1/subjects/{sid}/wearables/latest")
    assert w_latest and w_latest["data"]["bp"] == "120/80", w_latest
    print("PASS [SRD CARE DOMAIN + WEARABLE TELEMETRY SYNC (STEPS/BP/SLEEP/HR) -> DB]")

    # 7. Cleanup test user (cascades contacts & alerts)
    status, _ = request("DELETE", f"/api/v1/users/{uid}")
    assert status in (200, 204)
    print("PASS [CLEANUP & ALL LIVE E2E DB TESTS PASSED]")


if __name__ == "__main__":
    main()
