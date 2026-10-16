# ============================================================================
# Stage 1: deps — install dependencies
# ============================================================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy manifest and install dependencies.
# Only package.json is copied and `npm install` is used (no lock files).
COPY package.json ./
RUN npm install

# ============================================================================
# Stage 2: builder — compile the application
# ============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ============================================================================
# Stage 3: runner — minimal production runtime
# ============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# Security: run as a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

ENV NODE_ENV=production

COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:nodejs /app/package.json ./

USER appuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/index.js"]
