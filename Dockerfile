# Stage 1: Build
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files for dependency caching
COPY package.json package-lock.json* ./

# Install all dependencies (including devDependencies for build)
RUN npm ci || npm install

# Copy source files
COPY . .

# Build the Nuxt application
RUN npm run build

# Stage 2: Production
FROM node:20-slim AS production

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy built output and install production-only external deps
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./
RUN npm install --omit=dev ws

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/realtime').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
