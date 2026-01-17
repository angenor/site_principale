# ============================================
# Dockerfile for Nuxt 4 + Prisma + PostgreSQL
# Multi-stage build for optimized production image
# ============================================

# Stage 1: Base image with pnpm
FROM node:22-alpine AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# ============================================
# Stage 2: Install dependencies
# ============================================
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy prisma schema for client generation
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Generate Prisma client
RUN pnpm prisma generate

# ============================================
# Stage 3: Build the application
# ============================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/app/generated ./app/generated

# Copy source code
COPY . .

# Build arguments for environment variables
ARG NUXT_PUBLIC_API_BASE_URL
ARG NUXT_PUBLIC_SITE_URL
ARG DATABASE_URL

# Set environment variables for build
ENV NUXT_PUBLIC_API_BASE_URL=${NUXT_PUBLIC_API_BASE_URL}
ENV NUXT_PUBLIC_SITE_URL=${NUXT_PUBLIC_SITE_URL}
ENV DATABASE_URL=${DATABASE_URL}

# Build the application
RUN pnpm build

# ============================================
# Stage 4: Production image
# ============================================
FROM node:22-alpine AS production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nuxtjs

WORKDIR /app

# Copy built application from builder
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=builder --chown=nuxtjs:nodejs /app/package.json ./package.json

# Copy Prisma client complet (necessaire car externalise de Nitro)
COPY --from=deps --chown=nuxtjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps --chown=nuxtjs:nodejs /app/node_modules/.pnpm/@prisma* ./node_modules/.pnpm/
COPY --from=deps --chown=nuxtjs:nodejs /app/app/generated ./app/generated

# Copy prisma schema for potential migrations
COPY --from=builder --chown=nuxtjs:nodejs /app/prisma ./prisma

# Set environment variables
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose port
EXPOSE 3000

# Switch to non-root user
USER nuxtjs

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", ".output/server/index.mjs"]
