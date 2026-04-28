# ── Stage 1: install production dependencies ─────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production


# ── Stage 2: lean runtime image ──────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Non-root user — never run Node as root in a container
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what's needed to run
COPY --from=builder /app/node_modules ./node_modules
COPY server.js ./
COPY src/ ./src/
COPY urls.json ./

USER appuser

EXPOSE 3000

# K8s liveness probe uses this endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]