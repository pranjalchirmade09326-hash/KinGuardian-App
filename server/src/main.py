"""Uvicorn entrypoint for KinGuardian Backend Service."""

from __future__ import annotations

import logging

import uvicorn

from src.config import config

logging.basicConfig(
    level=getattr(logging, config.log_level.upper(), logging.INFO),
    format="%(asctime)s %(levelname)s %(name)s %(message)s",
)


def main() -> None:
    print("====================================================")
    print(f"KinGuardian Backend Service running on port {config.port}")
    print(f"Environment: {config.node_env}")
    print(f"Health endpoint: http://localhost:{config.port}/health")
    print(f"API v1 root: http://localhost:{config.port}/api/v1")
    print("====================================================")
    uvicorn.run(
        "src.app:app",
        host="0.0.0.0",
        port=config.port,
        reload=(config.node_env == "development"),
        log_level=config.log_level.lower(),
    )


if __name__ == "__main__":
    main()
