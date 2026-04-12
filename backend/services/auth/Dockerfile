# Single-stage — pnpm symlinks stay intact, no broken COPY between stages
FROM node:22-alpine
RUN corepack enable
WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile

RUN pnpm --filter @schoolos/types   build && \
    pnpm --filter @schoolos/config  build && \
    pnpm --filter @schoolos/utils   build

RUN cd backend/services/auth && pnpm build

WORKDIR /app/backend/services/auth
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/services/auth/src/main.js"]
