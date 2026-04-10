# ── Build stage ──
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/frontend/package.json ./packages/frontend/package.json
RUN npm ci --workspace=@argus/shared --workspace=@argus/frontend
COPY packages/shared ./packages/shared
COPY packages/frontend ./packages/frontend
RUN npm run build -w @argus/shared && npm run build -w @argus/frontend

# ── Serve with Nginx ──
FROM nginx:alpine AS production
COPY --from=builder /app/packages/frontend/dist /usr/share/nginx/html
COPY packages/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
