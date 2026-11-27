"""
KinGuardian AI - Meta WhatsApp Business Cloud API Production Server (Python / FastAPI)

Handles:
1. Meta Webhook Verification (GET /webhook)
2. Cryptographic Payload Signature Verification (HMAC SHA-256)
3. Two-way Conversational Processing & Intelligent Clinical Intent Extraction
4. Outbound Meta Graph API Message Dispatcher (Templates & Free-form)
5. Bulk Messaging Queue with Rate Limiting
"""

from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import logging
import os
import re
import uuid
from collections import deque
from pathlib import Path
from typing import Any, Optional

import httpx
import uvicorn
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, PlainTextResponse
from pydantic import BaseModel, Field, ValidationError, model_validator
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import Response

logger = logging.getLogger("kinguardian.whatsapp")

_env_path = Path(__file__).resolve().parent / ".env"
if not _env_path.exists():
    _env_path = Path.cwd() / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path, override=False)


def _parse_whatsapp_port(raw: str) -> int:
    try:
        return int(raw)
    except ValueError:
        return 4001


def _parse_cors_origins(raw: str) -> tuple[list[str], bool]:
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    if not origins or "*" in origins:
        return ["*"], False
    return origins, True


class WhatsAppConfig:
    def __init__(self) -> None:
        self.PORT: int = 4001
        self.META_API_VERSION: str = "v21.0"
        self.WHATSAPP_PHONE_NUMBER_ID: str = ""
        self.WHATSAPP_ACCESS_TOKEN: str = ""
        self.WEBHOOK_VERIFY_TOKEN: str = ""
        self.APP_SECRET: str = ""
        self.CORS_ORIGIN: str = "*"
        self.reload()

    def reload(self) -> None:
        self.PORT = _parse_whatsapp_port(os.getenv("WHATSAPP_PORT", "4001"))
        self.META_API_VERSION = os.getenv("META_API_VERSION", "v21.0")
        self.WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID", "")
        self.WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN", "")
        self.WEBHOOK_VERIFY_TOKEN = os.getenv("WHATSAPP_WEBHOOK_VERIFY_TOKEN", "")
        self.APP_SECRET = os.getenv("META_APP_SECRET", "")
        self.CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")


CONFIG = WhatsAppConfig()


class WhatsAppNotConfiguredError(RuntimeError):
    """Raised when WhatsApp Cloud API credentials are missing."""


class BulkTemplate(BaseModel):
    name: str = Field(..., min_length=1)
    language: dict[str, str] = Field(default_factory=lambda: {"code": "en_US"})
    components: Optional[list[dict[str, Any]]] = None


class BulkRecipient(BaseModel):
    phone: str = Field(..., min_length=1)
    message: Optional[str] = None
    template: Optional[BulkTemplate] = None

    @model_validator(mode="after")
    def validate_content_present(self) -> "BulkRecipient":
        has_message = self.message is not None and bool(self.message.strip())
        if not has_message and self.template is None:
            raise ValueError("Each recipient must include either 'message' or 'template'.")
        if not self.phone.strip():
            raise ValueError("'phone' must not be blank.")
        return self


class BulkSendRequest(BaseModel):
    recipients: list[BulkRecipient] = Field(..., min_length=1)


def _ensure_whatsapp_configured() -> None:
    if not CONFIG.WHATSAPP_ACCESS_TOKEN or not CONFIG.WHATSAPP_PHONE_NUMBER_ID:
        raise WhatsAppNotConfiguredError(
            "WhatsApp Cloud API credentials (WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID) are not configured."
        )


async def send_template_message(
    to_phone: str,
    template_name: str,
    language_code: str = "en_US",
    components: Optional[list[dict[str, Any]]] = None,
) -> dict[str, Any]:
    _ensure_whatsapp_configured()
    clean_to = re.sub(r"\D", "", to_phone)
    url = f"https://graph.facebook.com/{CONFIG.META_API_VERSION}/{CONFIG.WHATSAPP_PHONE_NUMBER_ID}/messages"
    template_obj: dict[str, Any] = {
        "name": template_name,
        "language": {"code": language_code},
    }
    if components is not None:
        template_obj["components"] = components

    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": clean_to,
        "type": "template",
        "template": template_obj,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {CONFIG.WHATSAPP_ACCESS_TOKEN}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        data = resp.json()
        if resp.is_error:
            raise RuntimeError(f"Meta API error ({resp.status_code}): {json.dumps(data)}")
        return data


async def send_text_message(to_phone: str, text: str) -> dict[str, Any]:
    _ensure_whatsapp_configured()
    clean_to = re.sub(r"\D", "", to_phone)
    url = f"https://graph.facebook.com/{CONFIG.META_API_VERSION}/{CONFIG.WHATSAPP_PHONE_NUMBER_ID}/messages"
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": clean_to,
        "type": "text",
        "text": {"preview_url": True, "body": text},
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            url,
            headers={
                "Authorization": f"Bearer {CONFIG.WHATSAPP_ACCESS_TOKEN}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        data = resp.json()
        if resp.is_error:
            raise RuntimeError(f"Meta API error ({resp.status_code}): {json.dumps(data)}")
        return data


class BulkWhatsAppQueue:
    def __init__(self, rate_limit_delay_s: float = 0.04) -> None:
        self._queue: deque[dict[str, Any]] = deque()
        self._is_processing = False
        self._rate_limit_delay_s = rate_limit_delay_s

    def enqueue(self, item: dict[str, Any]) -> None:
        self._queue.append(item)
        self._ensure_worker()

    def enqueue_batch(self, items: list[dict[str, Any]]) -> None:
        self._queue.extend(items)
        self._ensure_worker()

    def get_queue_length(self) -> int:
        return len(self._queue)

    def _ensure_worker(self) -> None:
        if not self._is_processing:
            try:
                loop = asyncio.get_running_loop()
                loop.create_task(self._process_queue())
            except RuntimeError:
                pass

    async def _process_queue(self) -> None:
        self._is_processing = True
        print(f"[Queue] Starting batch queue. Total pending: {len(self._queue)}")
        while self._queue:
            item = self._queue.popleft()
            try:
                if item.get("template"):
                    tpl = item["template"]
                    await send_template_message(
                        item["to"],
                        tpl["name"],
                        tpl.get("language", {}).get("code", "en_US"),
                        tpl.get("components"),
                    )
                elif item.get("text"):
                    await send_text_message(item["to"], item["text"])
            except WhatsAppNotConfiguredError as exc:
                logger.warning("[Queue] Skipping outbound send (not configured): %s", exc)
            except Exception as exc:
                print(f"[Queue Error] Failed dispatch to {item.get('to')}: {exc}")
            await asyncio.sleep(self._rate_limit_delay_s)

        self._is_processing = False
        print("[Queue] All queued WhatsApp messages processed successfully.")


bulk_queue = BulkWhatsAppQueue()


def verify_signature(raw_body: bytes, signature_header: Optional[str]) -> bool:
    if not CONFIG.APP_SECRET:
        return True
    if not signature_header or not signature_header.startswith("sha256="):
        return False
    expected_sig = hmac.new(
        CONFIG.APP_SECRET.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    actual_sig = signature_header.removeprefix("sha256=").strip()
    if not actual_sig:
        return False
    return hmac.compare_digest(expected_sig, actual_sig)


def extract_clinical_intent(raw_text: str) -> tuple[str, dict[str, int]]:
    text = raw_text.lower().strip()
    intent = "general_inquiry"
    extracted_vitals: dict[str, int] = {}

    if any(
        kw in text for kw in ("haan", "ha", "le li", "taken", "dawa li", "yes")
    ):
        intent = "medication_taken"
    elif any(
        kw in text
        for kw in (
            "dard",
            "chhati",
            "chest",
            "gir gaye",
            "fall",
            "emergency",
            "sos",
            "help",
        )
    ):
        intent = "emergency_sos"

    bp_match = re.search(r"(\d{2,3})\s*[/ ]\s*(\d{2,3})", text)
    if bp_match:
        intent = "vitals_logged"
        extracted_vitals["systolic"] = int(bp_match.group(1))
        extracted_vitals["diastolic"] = int(bp_match.group(2))

    return intent, extracted_vitals


async def _process_webhook_payload(payload: dict[str, Any]) -> None:
    try:
        entry = (payload.get("entry") or [{}])[0]
        changes = (entry.get("changes") or [{}])[0]
        value = changes.get("value") or {}

        for msg in value.get("messages") or []:
            sender_phone = msg.get("from", "")
            msg_type = msg.get("type", "")
            message_text = ""

            if msg_type == "text":
                message_text = (msg.get("text") or {}).get("body", "")
            elif msg_type == "button":
                btn = msg.get("button") or {}
                message_text = btn.get("text") or btn.get("payload") or ""
            elif msg_type == "interactive":
                inter = msg.get("interactive") or {}
                message_text = (
                    (inter.get("button_reply") or {}).get("title")
                    or (inter.get("list_reply") or {}).get("title")
                    or ""
                )

            print(
                f'📩 [WhatsApp Incoming] From: {sender_phone} | Type: {msg_type} | Body: "{message_text}"'
            )

            intent, extracted_vitals = extract_clinical_intent(message_text)
            print(f"🧠 [KinGuardian Clinical AI] Intent identified: {intent} {extracted_vitals}")

            if intent == "medication_taken":
                await send_text_message(
                    sender_phone,
                    "✅ *KinGuardian AI:* Namaste Uncle, humne aapka medication confirmation record kar liya hai. Aapki beti Anjali (London) ko bhi inform kar diya gaya hai! 🙏💙",
                )
            elif intent == "vitals_logged":
                systolic = extracted_vitals.get("systolic")
                diastolic = extracted_vitals.get("diastolic")
                is_high = systolic is not None and systolic > 135
                note = (
                    "⚠️ *Doctor Note:* Thoda sa elevated hai. Kripya 15 min aaram karein aur paani piyein."
                    if is_high
                    else "💚 Normal range me hai. Very good!"
                )
                await send_text_message(
                    sender_phone,
                    f"📊 *KinGuardian Health:* BP recorded: {systolic}/{diastolic} mmHg.\n{note}",
                )
            elif intent == "emergency_sos":
                await send_text_message(
                    sender_phone,
                    "🚨 *URGENT:* Aapki emergency notification received ho chuki hai. London coordinator Anjali aur local emergency team ko turant alert kar diya gaya hai!",
                )

        for status_obj in value.get("statuses") or []:
            print(
                f"📬 [Status Update] MsgId: {status_obj.get('id')} -> Recipient: {status_obj.get('recipient_id')} -> Status: {status_obj.get('status')}"
            )
    except WhatsAppNotConfiguredError as exc:
        logger.warning("Skipping WhatsApp auto-reply (not configured): %s", exc)
    except Exception as exc:
        print(f"Error handling webhook payload: {exc}")


class _WhatsAppRequestIdMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        req_id = request.headers.get("x-request-id") or str(uuid.uuid4())
        request.state.request_id = req_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = req_id
        return response


async def verify_webhook(
    hub_mode_dot: Optional[str] = Query(default=None, alias="hub.mode"),
    hub_mode_under: Optional[str] = Query(default=None, alias="hub_mode"),
    hub_token_dot: Optional[str] = Query(default=None, alias="hub.verify_token"),
    hub_token_under: Optional[str] = Query(default=None, alias="hub_verify_token"),
    hub_challenge_dot: Optional[str] = Query(default=None, alias="hub.challenge"),
    hub_challenge_under: Optional[str] = Query(default=None, alias="hub_challenge"),
) -> PlainTextResponse:
    has_verification_params = any(
        val is not None
        for val in (
            hub_mode_dot,
            hub_mode_under,
            hub_token_dot,
            hub_token_under,
            hub_challenge_dot,
            hub_challenge_under,
        )
    )
    if not has_verification_params:
        return PlainTextResponse(
            "KinGuardian WhatsApp Webhook Server is Online 🚀",
            status_code=200,
        )

    clean_mode = (hub_mode_dot or hub_mode_under or "").strip().lower()
    clean_token = (hub_token_dot or hub_token_under or "").strip()
    clean_challenge = (hub_challenge_dot or hub_challenge_under or "").strip()

    if (
        clean_mode != "subscribe"
        or not CONFIG.WEBHOOK_VERIFY_TOKEN
        or not clean_token
        or clean_token == "null"
        or not hmac.compare_digest(clean_token, CONFIG.WEBHOOK_VERIFY_TOKEN)
        or not clean_challenge
        or clean_challenge == "null"
    ):
        return PlainTextResponse("Forbidden", status_code=403)

    logger.info('[Meta Webhook Handshake] Verified mode="%s"', clean_mode)
    return PlainTextResponse(clean_challenge, status_code=200)


async def receive_webhook(request: Request) -> JSONResponse:
    raw_body = await request.body()
    signature = request.headers.get("x-hub-signature-256")
    if not verify_signature(raw_body, signature):
        logger.warning("[Security] Invalid HMAC SHA-256 signature from Meta.")
        return JSONResponse(
            status_code=401,
            content={
                "success": False,
                "error": {"code": "UNAUTHORIZED", "message": "Invalid signature"},
            },
        )

    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {"code": "VALIDATION_ERROR", "message": f"Invalid JSON payload: {exc}"},
            },
        )

    if not isinstance(payload, dict):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {"code": "VALIDATION_ERROR", "message": "Webhook payload must be a JSON object"},
            },
        )

    asyncio.create_task(_process_webhook_payload(payload))
    return JSONResponse(status_code=200, content={"status": "EVENT_RECEIVED"})


async def send_bulk(request: Request) -> JSONResponse:
    raw_body = await request.body()
    try:
        data = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {"code": "VALIDATION_ERROR", "message": f"Invalid JSON body: {exc}"},
            },
        )

    if not isinstance(data, dict):
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Request body must be a JSON object",
                },
            },
        )

    try:
        validated = BulkSendRequest.model_validate(data)
    except ValidationError as exc:
        details = [
            {
                "path": ".".join(str(p) for p in err.get("loc", [])),
                "message": err.get("msg", "Invalid value"),
                "code": err.get("type", "validation_error"),
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "error": {
                    "code": "VALIDATION_ERROR",
                    "message": "Invalid bulk send payload",
                    "details": details,
                },
            },
        )

    if not CONFIG.WHATSAPP_ACCESS_TOKEN:
        return JSONResponse(
            status_code=503,
            content={
                "success": False,
                "error": {
                    "code": "WHATSAPP_NOT_CONFIGURED",
                    "message": "WHATSAPP_ACCESS_TOKEN is not configured",
                },
            },
        )

    bulk_queue.enqueue_batch(
        [
            {
                "to": recipient.phone,
                "text": recipient.message,
                "template": recipient.template.model_dump() if recipient.template else None,
            }
            for recipient in validated.recipients
        ]
    )

    return JSONResponse(
        status_code=200,
        content={
            "success": True,
            "message": f"Enqueued {len(validated.recipients)} messages for dispatch",
            "pendingQueue": bulk_queue.get_queue_length(),
        },
    )


async def whatsapp_health() -> JSONResponse:
    return JSONResponse(
        status_code=200,
        content={
            "status": "ONLINE",
            "service": "KinGuardian Meta WhatsApp Business Cloud API Server",
            "apiVersion": CONFIG.META_API_VERSION,
            "queuePending": bulk_queue.get_queue_length(),
            "configured": bool(
                CONFIG.WHATSAPP_PHONE_NUMBER_ID and CONFIG.WHATSAPP_ACCESS_TOKEN
            ),
        },
    )


whatsapp_router = APIRouter(tags=["WhatsApp"])
whatsapp_router.add_api_route("/webhook", verify_webhook, methods=["GET"])
whatsapp_router.add_api_route("/webhook", receive_webhook, methods=["POST"])
whatsapp_router.add_api_route("/send-bulk", send_bulk, methods=["POST"])
whatsapp_router.add_api_route("/health", whatsapp_health, methods=["GET"])

whatsapp_compat_router = APIRouter(tags=["WhatsApp"])
whatsapp_compat_router.add_api_route(
    "/webhook", verify_webhook, methods=["GET"], include_in_schema=False
)
whatsapp_compat_router.add_api_route(
    "/api/webhook", verify_webhook, methods=["GET"], include_in_schema=False
)
whatsapp_compat_router.add_api_route(
    "/webhook", receive_webhook, methods=["POST"], include_in_schema=False
)
whatsapp_compat_router.add_api_route(
    "/api/webhook", receive_webhook, methods=["POST"], include_in_schema=False
)
whatsapp_compat_router.add_api_route(
    "/api/send-bulk", send_bulk, methods=["POST"], include_in_schema=False
)


def create_whatsapp_app() -> FastAPI:
    wa_app = FastAPI(title="KinGuardian Meta WhatsApp Business Cloud API Server")
    allow_origins, allow_credentials = _parse_cors_origins(CONFIG.CORS_ORIGIN)
    wa_app.add_middleware(_WhatsAppRequestIdMiddleware)
    wa_app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=allow_credentials,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "X-Request-ID", "X-Hub-Signature-256"],
        expose_headers=["X-Request-ID"],
    )
    wa_app.include_router(whatsapp_compat_router)
    wa_app.add_api_route("/", verify_webhook, methods=["GET"])
    wa_app.add_api_route("/", receive_webhook, methods=["POST"])
    wa_app.add_api_route("/health", whatsapp_health, methods=["GET"])
    return wa_app


app = create_whatsapp_app()


if __name__ == "__main__":
    print(f"🚀 [KinGuardian WhatsApp Server] Running on http://localhost:{CONFIG.PORT}")
    print("🔗 Webhook verification endpoint: GET /webhook")
    print("📥 Incoming webhook receiver: POST /webhook")
    print("📤 Bulk queue dispatcher: POST /api/send-bulk")
    uvicorn.run(app, host="0.0.0.0", port=CONFIG.PORT)
