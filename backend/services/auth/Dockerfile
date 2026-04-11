# ── Stage 1: install deps ─────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./

COPY packages/types/package.json        packages/types/
COPY packages/config/package.json       packages/config/
COPY packages/utils/package.json        packages/utils/
COPY packages/api/package.json          packages/api/
COPY packages/ui/package.json           packages/ui/

COPY backend/libs/database/package.json    backend/libs/database/
COPY backend/libs/decorators/package.json  backend/libs/decorators/
COPY backend/libs/filters/package.json     backend/libs/filters/
COPY backend/libs/guards/package.json      backend/libs/guards/
COPY backend/libs/interceptors/package.json backend/libs/interceptors/
COPY backend/libs/middleware/package.json   backend/libs/middleware/

COPY backend/services/auth/package.json backend/services/auth/

RUN pnpm install --frozen-lockfile --filter @schoolos/auth-service...

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

COPY packages/         packages/
COPY backend/libs/     backend/libs/
COPY backend/services/auth/ backend/services/auth/

RUN cd backend/services/auth && pnpm build

# ── Stage 3: run ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/backend/services/auth/dist         ./dist
COPY --from=builder /app/backend/services/auth/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main"]
