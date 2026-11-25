"""Application configuration loaded from environment variables and .env."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

# Load .env from cwd or server directory if present
_env_path = Path.cwd() / ".env"
if not _env_path.exists():
    _env_path = Path(__file__).resolve().parent.parent / ".env"
if _env_path.exists():
    load_dotenv(dotenv_path=_env_path)


@dataclass(frozen=True)
class Config:
    port: int
    node_env: str
    database_url: str
    cors_origin: str
    log_level: str


def load_config() -> Config:
    port_raw = os.getenv("PORT", "4000")
    try:
        port = int(port_raw)
    except ValueError:
        port = 4000

    return Config(
        port=port,
        node_env=os.getenv("NODE_ENV", "development"),
        database_url=os.getenv(
            "DATABASE_URL",
            "postgresql://kinguardian:kinguardian_secret_pw@localhost:5432/kinguardian_db",
        ),
        cors_origin=os.getenv("CORS_ORIGIN", "*"),
        log_level=os.getenv("LOG_LEVEL", "info"),
    )


config = load_config()
