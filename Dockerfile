FROM --platform=linux/amd64 node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install necessary system dependencies
RUN apk add --no-cache libc6-compat
RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python
RUN apk add --no-cache g++ make
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time arguments for environment variables
ARG BASE_URL
ARG AUTH_SECRET
ARG RESEND_API_KEY
ARG GITHUB_CLIENT_ID
ARG GITHUB_CLIENT_SECRET
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG DATABASE_URL
ARG COINPAYMENTS_API_KEY
ARG COINPAYMENTS_API_SECRET
ARG OWNER_USDT_ADDRESS
ARG OWNER_TRC_ADDRESS

# Set environment variables during build
ENV BASE_URL=${BASE_URL}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV RESEND_API_KEY=${RESEND_API_KEY}
ENV GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
ENV GITHUB_CLIENT_SECRET=${GITHUB_CLIENT_SECRET}
ENV GOOGLE_CLIENT_ID=${GOOGLE_CLIENT_ID}
ENV GOOGLE_CLIENT_SECRET=${GOOGLE_CLIENT_SECRET}
ENV DATABASE_URL=${DATABASE_URL}
ENV COINPAYMENTS_API_KEY=${COINPAYMENTS_API_KEY}
ENV COINPAYMENTS_API_SECRET=${COINPAYMENTS_API_SECRET}
ENV OWNER_USDT_ADDRESS=${OWNER_USDT_ADDRESS}
ENV OWNER_TRC_ADDRESS=${OWNER_TRC_ADDRESS}

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED 1

# Generate Prisma client and build the application
RUN yarn prisma generate
RUN yarn build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public files
COPY --from=builder /app/public ./public

# Copy standalone and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma files
COPY --from=builder /app/prisma /app/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Set permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port (changed to 3000 as per Next.js default)
EXPOSE 9000

# Set port environment variable
ENV PORT 9000
ENV HOSTNAME "0.0.0.0"

# Run the application
CMD ["node", "server.js"]