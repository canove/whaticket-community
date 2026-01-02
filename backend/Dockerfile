# Stage 1: Builder
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
# If you have a lock file, uncomment the next line
# COPY package-lock.json ./

RUN npm install

# Copy source code
COPY . .

# Build the project (if using TypeScript or a build step)
RUN npm run build --if-present

# Stage 2: Runner
FROM node:22-alpine AS runner

WORKDIR /app

# Set environment variables for performance
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV UV_THREADPOOL_SIZE=16

# Create a non-root user 'node' (already exists in alpine node images) and give permissions
RUN chown -R node:node /app

# Switch to non-root user
USER node

# Copy built artifacts and dependencies from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app .

# Expose port
EXPOSE 8080

# Command to run the application
CMD ["npm", "start"]
