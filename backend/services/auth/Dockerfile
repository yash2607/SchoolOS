# ── Stage 1: deps ─────────────────────────────────────────────────────────────
FROM node:22-alpine AS deps
RUN corepack enable

WORKDIR /app

# Copy workspace manifests for pnpm to resolve the graph
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY tsconfig.base.json ./

# Only packages that are real npm workspace packages (have package.json)
COPY packages/types/package.json        packages/types/
COPY packages/config/package.json       packages/config/
COPY packages/utils/package.json        packages/utils/
COPY packages/api/package.json          packages/api/
COPY packages/ui/package.json           packages/ui/

COPY backend/services/auth/package.json backend/services/auth/

# Install deps for auth-service and its workspace dependencies
RUN pnpm install --frozen-lockfile --filter @schoolos/auth-service...

# ── Stage 2: build ────────────────────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

# Copy workspace package sources
COPY packages/ packages/

# Copy shared libs (raw TS files, no package.json — compiled inline)
COPY backend/libs/ backend/libs/

# Copy auth service source
COPY backend/services/auth/ backend/services/auth/

RUN cd backend/services/auth && pnpm build

# ── Stage 3: runner ───────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/backend/services/auth/dist         ./dist
COPY --from=builder /app/backend/services/auth/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main"]
