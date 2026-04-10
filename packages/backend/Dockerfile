# ── Build stage ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY ../../package.json ../../package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/backend/package.json ./packages/backend/package.json
RUN npm ci --workspace=@argus/shared --workspace=@argus/backend
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend
RUN npm run build -w @argus/shared && npm run build -w @argus/backend

# ── Production stage ──
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/package.json ./
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/backend/package.json ./packages/backend/package.json
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist
RUN npm ci --workspace=@argus/shared --workspace=@argus/backend --omit=dev
EXPOSE 3001
CMD ["node", "packages/backend/dist/index.js"]

# ── Development stage ──
FROM node:20-alpine AS development
WORKDIR /app
COPY ../../package.json ../../package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/backend/package.json ./packages/backend/package.json
RUN npm ci --workspace=@argus/shared --workspace=@argus/backend
COPY packages/shared ./packages/shared
COPY packages/backend ./packages/backend
EXPOSE 3001
CMD ["npm", "run", "dev", "-w", "@argus/backend"]
