"""Security, schema validation, and routing tests for WhatsApp Webhook Server."""

from __future__ import annotations

import hashlib
import hmac
import json
from collections.abc import Iterator
from typing import Any

import httpx
import pytest
from fastapi.testclient import TestClient

import whatsapp_webhook_server as wa
from src.app import create_app
from src.db.in_memory_db import InMemoryDb
from src.db.pool import enable_in_memory_fallback


@pytest.fixture
def wa_client(monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.setenv("WHATSAPP_PORT", "4001")
    monkeypatch.delenv("WHATSAPP_ACCESS_TOKEN", raising=False)
    monkeypatch.delenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", raising=False)
    monkeypatch.delenv("WHATSAPP_PHONE_NUMBER_ID", raising=False)
    monkeypatch.delenv("META_APP_SECRET", raising=False)
    monkeypatch.setenv("CORS_ORIGIN", "*")
    wa.CONFIG.reload()
    wa.bulk_queue._queue.clear()
    test_wa_app = wa.create_whatsapp_app()
    with TestClient(test_wa_app) as c:
        yield c
    wa.bulk_queue._queue.clear()
    wa.CONFIG.reload()


@pytest.fixture
def main_client(monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.delenv("WHATSAPP_ACCESS_TOKEN", raising=False)
    monkeypatch.delenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", raising=False)
    monkeypatch.delenv("META_APP_SECRET", raising=False)
    wa.CONFIG.reload()
    wa.bulk_queue._queue.clear()
    InMemoryDb.get_instance().reset(seed_demo=True)
    enable_in_memory_fallback()
    main_app = create_app()
    with TestClient(main_app) as c:
        yield c
    wa.bulk_queue._queue.clear()
    wa.CONFIG.reload()


def _sign_body(secret: str, body: bytes) -> str:
    digest = hmac.new(secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def test_whatsapp_config_defaults_have_no_hardcoded_secrets(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.delenv("WHATSAPP_PORT", raising=False)
    monkeypatch.setenv("PORT", "4000")
    monkeypatch.delenv("WHATSAPP_ACCESS_TOKEN", raising=False)
    monkeypatch.delenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", raising=False)
    monkeypatch.delenv("META_APP_SECRET", raising=False)

    cfg = wa.WhatsAppConfig()
    assert cfg.PORT == 4001
    assert cfg.WHATSAPP_ACCESS_TOKEN == ""
    assert cfg.WEBHOOK_VERIFY_TOKEN == ""
    assert cfg.APP_SECRET == ""


def test_webhook_get_verification_security(wa_client: TestClient) -> None:
    # No query params -> online banner 200
    for path in ("/", "/webhook", "/api/webhook"):
        res = wa_client.get(path)
        assert res.status_code == 200
        assert "Online" in res.text

    # Unset WEBHOOK_VERIFY_TOKEN -> 403 even with matching-looking params
    res_unset = wa_client.get(
        "/webhook",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "anything",
            "hub.challenge": "12345",
        },
    )
    assert res_unset.status_code == 403

    wa.CONFIG.WEBHOOK_VERIFY_TOKEN = "super-secret-verify-token"

    # Valid verification -> 200 + challenge (dot and underscore aliases)
    ok_dot = wa_client.get(
        "/webhook",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "super-secret-verify-token",
            "hub.challenge": "challenge-abc",
        },
    )
    assert ok_dot.status_code == 200
    assert ok_dot.text == "challenge-abc"

    ok_under = wa_client.get(
        "/api/webhook",
        params={
            "hub_mode": "subscribe",
            "hub_verify_token": "super-secret-verify-token",
            "hub_challenge": "challenge-xyz",
        },
    )
    assert ok_under.status_code == 200
    assert ok_under.text == "challenge-xyz"

    # Wrong token, missing token, wrong mode, missing/'null' challenge -> 403
    bad_cases = [
        {"hub.mode": "subscribe", "hub.verify_token": "wrong", "hub.challenge": "123"},
        {"hub.mode": "subscribe", "hub.challenge": "123"},
        {
            "hub.mode": "unsubscribe",
            "hub.verify_token": "super-secret-verify-token",
            "hub.challenge": "123",
        },
        {
            "hub.mode": "subscribe",
            "hub.verify_token": "super-secret-verify-token",
            "hub.challenge": "null",
        },
        {
            "hub.mode": "subscribe",
            "hub.verify_token": "super-secret-verify-token",
        },
    ]
    for params in bad_cases:
        res = wa_client.get("/webhook", params=params)
        assert res.status_code == 403


def test_webhook_post_hmac_signature_and_payload_validation(
    wa_client: TestClient,
) -> None:
    payload_bytes = json.dumps({"object": "whatsapp_business_account", "entry": []}).encode("utf-8")

    # Dev mode (APP_SECRET empty) -> 200
    dev_res = wa_client.post(
        "/webhook",
        content=payload_bytes,
        headers={"Content-Type": "application/json"},
    )
    assert dev_res.status_code == 200
    assert dev_res.json()["status"] == "EVENT_RECEIVED"

    # Production mode (APP_SECRET configured) -> missing header MUST return 401
    wa.CONFIG.APP_SECRET = "my_meta_app_secret"

    missing_sig = wa_client.post(
        "/webhook",
        content=payload_bytes,
        headers={"Content-Type": "application/json"},
    )
    assert missing_sig.status_code == 401

    bad_prefix = wa_client.post(
        "/api/webhook",
        content=payload_bytes,
        headers={
            "Content-Type": "application/json",
            "x-hub-signature-256": hmac.new(
                b"my_meta_app_secret", payload_bytes, hashlib.sha256
            ).hexdigest(),
        },
    )
    assert bad_prefix.status_code == 401

    bad_digest = wa_client.post(
        "/webhook",
        content=payload_bytes,
        headers={
            "Content-Type": "application/json",
            "x-hub-signature-256": "sha256=deadbeef",
        },
    )
    assert bad_digest.status_code == 401

    valid_sig = _sign_body("my_meta_app_secret", payload_bytes)
    ok_res = wa_client.post(
        "/webhook",
        content=payload_bytes,
        headers={
            "Content-Type": "application/json",
            "x-hub-signature-256": valid_sig,
        },
    )
    assert ok_res.status_code == 200
    assert ok_res.json() == {"status": "EVENT_RECEIVED"}

    # Invalid JSON & non-dict JSON -> 400
    bad_json_bytes = b"{not valid json"
    bad_json_res = wa_client.post(
        "/webhook",
        content=bad_json_bytes,
        headers={
            "Content-Type": "application/json",
            "x-hub-signature-256": _sign_body("my_meta_app_secret", bad_json_bytes),
        },
    )
    assert bad_json_res.status_code == 400

    list_json_bytes = b"[]"
    list_json_res = wa_client.post(
        "/webhook",
        content=list_json_bytes,
        headers={
            "Content-Type": "application/json",
            "x-hub-signature-256": _sign_body("my_meta_app_secret", list_json_bytes),
        },
    )
    assert list_json_res.status_code == 400


def test_send_bulk_validation_400_and_unconfigured_503(wa_client: TestClient) -> None:
    # 1. Invalid JSON -> 400 (never 500)
    bad_json = wa_client.post(
        "/api/send-bulk",
        content=b"{broken",
        headers={"Content-Type": "application/json"},
    )
    assert bad_json.status_code == 400
    assert bad_json.json()["error"]["code"] == "VALIDATION_ERROR"

    # 2. Non-dict JSON payloads -> 400 (never 500)
    for raw_payload in (b"[]", b'"hello"', b"123", b"null"):
        non_dict = wa_client.post(
            "/api/send-bulk",
            content=raw_payload,
            headers={"Content-Type": "application/json"},
        )
        assert non_dict.status_code == 400
        assert non_dict.json()["error"]["code"] == "VALIDATION_ERROR"

    # 3. Invalid schema variants -> 400
    invalid_bodies: list[dict[str, Any]] = [
        {},
        {"recipients": []},
        {"recipients": "not-a-list"},
        {"recipients": ["not-a-dict"]},
        {"recipients": [{"message": "Missing phone"}]},
        {"recipients": [{"phone": "   ", "message": "Blank phone"}]},
        {"recipients": [{"phone": "+919876543210"}]},
        {"recipients": [{"phone": "+919876543210", "message": "   "}]},
    ]
    for body in invalid_bodies:
        res = wa_client.post("/api/send-bulk", json=body)
        assert res.status_code == 400
        assert res.json()["error"]["code"] == "VALIDATION_ERROR"

    # 4. Valid schema + unset WHATSAPP_ACCESS_TOKEN -> 503
    valid_body = {
        "recipients": [{"phone": "+919876543210", "message": "Daily check-in reminder"}]
    }
    unconfigured_res = wa_client.post("/api/send-bulk", json=valid_body)
    assert unconfigured_res.status_code == 503
    assert unconfigured_res.json()["error"]["code"] == "WHATSAPP_NOT_CONFIGURED"

    # 5. Valid schema + configured token -> 200
    wa.CONFIG.WHATSAPP_ACCESS_TOKEN = "test-wa-token"
    ok_res = wa_client.post("/api/send-bulk", json=valid_body)
    assert ok_res.status_code == 200
    assert ok_res.json()["success"] is True
    assert ok_res.json()["pendingQueue"] >= 1


async def test_outbound_send_guard_and_mock_transport(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    wa.CONFIG.WHATSAPP_ACCESS_TOKEN = ""
    wa.CONFIG.WHATSAPP_PHONE_NUMBER_ID = ""

    with pytest.raises(wa.WhatsAppNotConfiguredError):
        await wa.send_text_message("+919876543210", "Hello")

    with pytest.raises(wa.WhatsAppNotConfiguredError):
        await wa.send_template_message("+919876543210", "daily_checkin")

    wa.CONFIG.WHATSAPP_ACCESS_TOKEN = "test-token"
    wa.CONFIG.WHATSAPP_PHONE_NUMBER_ID = "1234567890"

    captured: list[dict[str, Any]] = []

    def handler(request: httpx.Request) -> httpx.Response:
        captured.append(
            {
                "url": str(request.url),
                "auth": request.headers.get("Authorization"),
                "body": json.loads(request.content.decode("utf-8")),
            }
        )
        return httpx.Response(200, json={"messages": [{"id": "wamid.test"}]})

    transport = httpx.MockTransport(handler)
    real_async_client = httpx.AsyncClient

    def mocked_client(*args: Any, **kwargs: Any) -> httpx.AsyncClient:
        kwargs["transport"] = transport
        return real_async_client(*args, **kwargs)

    monkeypatch.setattr(wa.httpx, "AsyncClient", mocked_client)

    res = await wa.send_text_message("+91 98765-43210", "Namaste")
    assert res["messages"][0]["id"] == "wamid.test"
    assert captured[0]["auth"] == "Bearer test-token"
    assert captured[0]["body"]["to"] == "919876543210"
    assert captured[0]["body"]["text"]["body"] == "Namaste"


def test_standalone_cors_and_request_id(wa_client: TestClient) -> None:
    res = wa_client.get(
        "/health",
        headers={"Origin": "http://localhost:8081", "X-Request-ID": "wa-req-1"},
    )
    assert res.status_code == 200
    assert res.headers.get("x-request-id") == "wa-req-1"
    assert res.headers.get("access-control-allow-origin") == "*"
    assert res.headers.get("access-control-allow-credentials") != "true"


def test_mounted_whatsapp_routes_on_main_app(main_client: TestClient) -> None:
    # Main /health is NOT shadowed by WhatsApp /health
    main_health = main_client.get("/health")
    assert main_health.status_code == 200
    assert main_health.json()["status"] == "ok"

    wa_health = main_client.get("/api/v1/whatsapp/health")
    assert wa_health.status_code == 200
    assert wa_health.json()["status"] == "ONLINE"

    wa.CONFIG.WEBHOOK_VERIFY_TOKEN = "mounted-secret"
    verify = main_client.get(
        "/api/v1/whatsapp/webhook",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "mounted-secret",
            "hub.challenge": "mounted-ok",
        },
    )
    assert verify.status_code == 200
    assert verify.text == "mounted-ok"

    compat_verify = main_client.get(
        "/api/webhook",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "wrong",
            "hub.challenge": "nope",
        },
    )
    assert compat_verify.status_code == 403

    bulk_bad = main_client.post("/api/v1/whatsapp/send-bulk", json={"recipients": []})
    assert bulk_bad.status_code == 400
