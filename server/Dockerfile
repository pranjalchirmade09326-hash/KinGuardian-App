# ==============================================================================
# KinGuardian Backend Service Dockerfile (Python / FastAPI)
# Multi-stage build for optimal production image size and security
# Base: Python 3.12 Slim
# ==============================================================================

FROM python:3.12-slim AS builder

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ------------------------------------------------------------------------------
# Stage 2: Production Runner
# ------------------------------------------------------------------------------
FROM python:3.12-slim AS runner

LABEL maintainer="KinGuardian Team"
LABEL description="KinGuardian Backend Service (Python & FastAPI)"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    NODE_ENV=production \
    PORT=4000 \
    PATH="/opt/venv/bin:$PATH"

WORKDIR /app

RUN groupadd --system appuser && useradd --system --gid appuser appuser

COPY --from=builder /opt/venv /opt/venv
COPY --chown=appuser:appuser src/ ./src/
COPY --chown=appuser:appuser whatsapp_webhook_server.py ./

USER appuser

EXPOSE 4000

CMD ["uvicorn", "src.app:app", "--host", "0.0.0.0", "--port", "4000"]
