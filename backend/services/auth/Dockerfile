# ─── Stage 1: builder ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app

# Copy entire repo so pnpm can resolve the full workspace graph
COPY . .

RUN pnpm install --frozen-lockfile

# Build shared packages before auth-service (they produce dist/ that TS needs)
RUN pnpm --filter @schoolos/types   build && \
    pnpm --filter @schoolos/config  build && \
    pnpm --filter @schoolos/utils   build

RUN cd backend/services/auth && pnpm build

# ─── Stage 2: runner ──────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/backend/services/auth/dist         ./dist
COPY --from=builder /app/backend/services/auth/node_modules ./node_modules

EXPOSE 3001
CMD ["node", "dist/main"]
