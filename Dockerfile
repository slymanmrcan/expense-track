# -------------------------
# Base image
# -------------------------
FROM node:20-slim AS base

# Install OpenSSL (Required for Prisma) and dumb-init (For signal handling)
RUN apt-get update -y \
    && apt-get install -y openssl dumb-init \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# -------------------------
# Dependencies
# -------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Use cache mount to speed up installation
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps

# -------------------------
# Build
# -------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app (needs dummy DATABASE_URL for build-time checks)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npm run build

# -------------------------
# Runner
# -------------------------
FROM base AS runner

ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /app

# Set correct permissions for the nextjs user
RUN mkdir -p .next \
    && chown nextjs:nodejs .next

# Copy standalone build (This includes a pruned node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy necessary files for Prisma CLI (Migrate/Seed)
# Note: Provide full node_modules if you rely on arbitrary npx commands in entrypoint
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Use dumb-init as the entrypoint to handle signals properly
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["./docker-entrypoint.sh"]
