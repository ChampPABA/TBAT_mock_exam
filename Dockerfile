FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

# Copy Prisma files for production
COPY --from=builder /app/apps/web/prisma ./apps/web/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set correct permissions
RUN chown nextjs:nodejs apps/web

# Health check script
RUN echo '#!/bin/sh\nwget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1' > /healthcheck.sh \
    && chmod +x /healthcheck.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Production health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD /healthcheck.sh

CMD ["node", "apps/web/server.js"]

# Development stage with hot reload
FROM base AS development
WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl libc6-compat

# Copy package files
COPY package.json package-lock.json* ./

# Install all dependencies including dev dependencies
RUN npm install

# Copy source code
COPY . .

EXPOSE 3000

ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Development health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Hot reload command
CMD ["npm", "run", "dev"]