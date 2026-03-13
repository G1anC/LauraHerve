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

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN if [ -z "$VITE_API_URL" ]; then \
      echo "WARNING: VITE_API_URL is not set during build."; \
      echo "The app will use http://localhost:3001 as fallback."; \
    fi

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

CMD ["bun", "apps/backoffice/build/index.js"]
