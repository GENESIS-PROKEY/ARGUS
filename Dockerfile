# ── Stage 1: Build ──
FROM node:22-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source
COPY packages/shared packages/shared
COPY packages/backend packages/backend
COPY packages/frontend packages/frontend

# Build shared types
RUN npm run build -w @argus/shared

# Build frontend (Vite)
RUN npm run build -w @argus/frontend

# Build backend (TypeScript)
RUN npm run build -w @argus/backend

# ── Stage 2: Production ──
FROM node:22-alpine AS runner

WORKDIR /app

# Security: run as non-root
RUN addgroup --system argus && adduser --system --ingroup argus argus

# Copy root package files
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

# Install production dependencies only
RUN npm ci --omit=dev && npm cache clean --force

# Copy built artifacts
COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/backend/dist packages/backend/dist
COPY --from=builder /app/packages/frontend/dist packages/frontend/dist

# Expose port
ENV PORT=3001
ENV NODE_ENV=production
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/api/health || exit 1

USER argus

CMD ["node", "packages/backend/dist/index.js"]
