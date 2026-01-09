# Multi-stage Dockerfile for Student-Company Matching Platform
# Optimized for both development and production environments

# Base stage with Node.js
FROM node:20-alpine AS base
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Development stage
FROM base AS development
ENV NODE_ENV=development

# Install all dependencies (including dev dependencies)
RUN npm ci --include=dev

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p uploads logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Start development server
CMD ["npm", "run", "dev"]

# Dependencies stage for production
FROM base AS dependencies
ENV NODE_ENV=production

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Generate Prisma client
RUN npx prisma generate

# Build stage
FROM base AS build
ENV NODE_ENV=production

# Install all dependencies for building
RUN npm ci --include=dev

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine AS production
WORKDIR /app

# Install system dependencies for production
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Copy built application
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist
COPY --from=build --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nodejs:nodejs /app/package*.json ./

# Create necessary directories
RUN mkdir -p uploads logs && chown -R nodejs:nodejs uploads logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start production server
CMD ["npm", "start"]