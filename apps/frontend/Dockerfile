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

RUN bun install --frozen-lockfile

ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL

RUN if [ -z "$PUBLIC_API_URL" ]; then \
      echo "WARNING: PUBLIC_API_URL is not set during build."; \
      echo "Make sure it's set as a runtime environment variable in Railway."; \
    fi

RUN bun run build --filter=@repo/frontend

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 frontend

COPY --from=builder --chown=frontend:nodejs /app/apps/frontend/build ./apps/frontend/build
COPY --from=builder --chown=frontend:nodejs /app/apps/frontend/package.json ./apps/frontend/
COPY --from=builder --chown=frontend:nodejs /app/packages ./packages
COPY --from=builder --chown=frontend:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=frontend:nodejs /app/package.json ./

USER frontend

EXPOSE 3000

CMD ["bun", "apps/frontend/build/index.js"]
