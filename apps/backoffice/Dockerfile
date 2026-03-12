FROM oven/bun:1.3.7-alpine AS base

FROM base AS deps
WORKDIR /app

COPY package.json bun.lock ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/backoffice/package.json ./apps/backoffice/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages ./packages

RUN bun install

FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG PUBLIC_BACKEND_URL
ENV PUBLIC_BACKEND_URL=$PUBLIC_BACKEND_URL

RUN bun run build --filter=@repo/backoffice

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 backoffice

COPY --from=builder --chown=backoffice:nodejs /app/apps/backoffice/build ./apps/backoffice/build
COPY --from=builder --chown=backoffice:nodejs /app/apps/backoffice/package.json ./apps/backoffice/
COPY --from=builder --chown=backoffice:nodejs /app/packages ./packages
COPY --from=builder --chown=backoffice:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=backoffice:nodejs /app/package.json ./

USER backoffice

EXPOSE 3000

CMD ["bun", "run", "apps/backoffice/build"]
