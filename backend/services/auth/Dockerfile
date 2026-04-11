# ── Stage 1: install deps ─────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY packages/ packages/
COPY backend/services/auth/package.json backend/services/auth/

RUN pnpm install --frozen-lockfile --filter @schoolos/auth-service...

# ── Stage 2: build workspace packages ─────────────────────────────────────────
FROM deps AS pkg-builder
WORKDIR /app

RUN pnpm --filter @schoolos/types   build && \
    pnpm --filter @schoolos/config  build && \
    pnpm --filter @schoolos/utils   build

# ── Stage 3: build auth service ───────────────────────────────────────────────
FROM pkg-builder AS builder
WORKDIR /app

COPY backend/libs/     backend/libs/
COPY backend/services/auth/ backend/services/auth/

RUN cd backend/services/auth && pnpm build

# ── Stage 4: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/backend/services/auth/dist         ./dist
COPY --from=builder /app/backend/services/auth/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main"]
