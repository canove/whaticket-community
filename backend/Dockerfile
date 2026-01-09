# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production=false

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Prune dev dependencies
RUN npm prune --production

# ================================
# Production stage
# ================================
FROM node:22-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init wget

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 -G nodejs

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/prisma.config.ts ./

# Create directories
RUN mkdir -p sessions public && chown -R nestjs:nodejs sessions public

# Switch to non-root user
USER nestjs

# Environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/v1/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["sh", "-c", "npx prisma db push --url $DATABASE_URL && node dist/main.js"]
