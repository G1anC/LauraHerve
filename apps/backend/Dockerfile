FROM oven/bun:1.3.7-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backoffice/package.json ./apps/backoffice/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages ./packages

RUN bun install --production

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run db:generate

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backend

COPY --from=builder --chown=backend:nodejs /app/apps/backend ./apps/backend
COPY --from=builder --chown=backend:nodejs /app/packages ./packages
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backend:nodejs /app/package.json ./
COPY --from=builder --chown=backend:nodejs /app/turbo.json ./

USER backend

EXPOSE 3001

CMD ["bun", "run", "apps/backend/src/index.ts"]
