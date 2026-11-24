# ==============================================================================
# KinGuardian Backend Service Dockerfile
# Multi-stage build for optimal production image size and security
# Base: Node.js 20 Alpine Linux
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build & Compile TypeScript
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy TypeScript configuration and source tree
COPY tsconfig.json ./
COPY src/ ./src/

# Compile TypeScript to JavaScript in dist/
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Production Runner
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

LABEL maintainer="KinGuardian Team"
LABEL description="KinGuardian Backend Service (Node.js & TypeScript)"

# Define environment variables
ENV NODE_ENV=production \
    PORT=4000

WORKDIR /app

# Install tsx globally to ensure `npm run migrate` runs seamlessly in container
RUN npm install -g tsx

# Install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript output from builder stage
COPY --chown=node:node --from=builder /app/dist ./dist

# Copy configuration, migrations and database scripts for runtime migration execution
COPY --chown=node:node src/config ./src/config
COPY --chown=node:node src/db ./src/db
COPY --chown=node:node --from=builder /app/src/db/migrations ./dist/db/migrations

# Ensure all files in working directory are owned by unprivileged node user
RUN chown -R node:node /app

# Switch to unprivileged non-root user for container security
USER node

# Expose backend API port
EXPOSE 4000

# Native container healthcheck probe
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:4000/health || exit 1

# Default runtime entrypoint
CMD ["node", "dist/index.js"]
