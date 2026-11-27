"""Application configuration loaded from environment variables and .env."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv

# Load .env from cwd or server directory if present
_env_path = Path.cwd() / ".env"
if not _env_path.exists():
    _env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)


def parse_cors_origins(raw: str) -> tuple[list[str], bool]:
    """Split comma-separated CORS origins and enforce credential safety for '*'."""
    origins = [origin.strip() for origin in raw.split(",") if origin.strip()]
    if not origins or "*" in origins:
        return ["*"], False
    return origins, True


def _parse_bool_env(name: str) -> Optional[bool]:
    raw = os.getenv(name)
    if raw is None or not raw.strip():
        return None
    return raw.strip().lower() in ("1", "true", "yes", "on")


@dataclass(frozen=True)
class Config:
    port: int
    node_env: str
    database_url: str
    cors_origin: str
    cors_origins: list[str]
    cors_allow_credentials: bool
    log_level: str
    use_in_memory_db: bool
    database_url_explicit: bool
    allow_in_memory_fallback: bool


def load_config() -> Config:
    port_raw = os.getenv("PORT", "4000")
    try:
        port = int(port_raw)
    except ValueError:
        port = 4000

    node_env = os.getenv("NODE_ENV", "development").strip() or "development"
    explicit_db_url = os.getenv("DATABASE_URL", "").strip()
    database_url_explicit = bool(explicit_db_url)
    database_url = (
        explicit_db_url
        or "postgresql://kinguardian:kinguardian_secret_pw@localhost:5432/kinguardian_db"
    )

    cors_origin = os.getenv("CORS_ORIGIN", "*")
    cors_origins, cors_allow_credentials = parse_cors_origins(cors_origin)

    use_in_memory_db = _parse_bool_env("USE_IN_MEMORY_DB") is True
    allow_fallback_env = _parse_bool_env("ALLOW_IN_MEMORY_FALLBACK")
    if allow_fallback_env is not None:
        allow_in_memory_fallback = allow_fallback_env
    elif node_env.lower() == "production" or database_url_explicit:
        allow_in_memory_fallback = False
    else:
        allow_in_memory_fallback = True

    return Config(
        port=port,
        node_env=node_env,
        database_url=database_url,
        cors_origin=cors_origin,
        cors_origins=cors_origins,
        cors_allow_credentials=cors_allow_credentials,
        log_level=os.getenv("LOG_LEVEL", "info"),
        use_in_memory_db=use_in_memory_db,
        database_url_explicit=database_url_explicit,
        allow_in_memory_fallback=allow_in_memory_fallback,
    )


config = load_config()
