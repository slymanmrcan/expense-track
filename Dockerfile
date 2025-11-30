# -------------------------
# Base image
# -------------------------
FROM node:20-slim AS base

# OpenSSL (Prisma için zorunlu)
RUN apt-get update -y \
    && apt-get install -y openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# -------------------------
# Dependencies
# -------------------------
FROM base AS deps
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci

# -------------------------
# Build
# -------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma Client generate
RUN npx prisma generate

# Next.js build
RUN npm run build

# -------------------------
# Runner
# -------------------------
FROM base AS runner

ENV NODE_ENV=production

# User creation
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

WORKDIR /app

# Standalone dosyaları taşı
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma CLI ve client için gerekli dosyalar
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Entrypoint ekle
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENV HOME=/home/nextjs
RUN mkdir -p /home/nextjs && chown -R nextjs:nodejs /home/nextjs

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./docker-entrypoint.sh"]
