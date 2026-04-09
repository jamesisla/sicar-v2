# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# ── Stage 2: production ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

# Install Oracle Instant Client dependencies
RUN apk add --no-cache libaio libnsl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --prefer-offline

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
