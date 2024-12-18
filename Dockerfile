# Step 1: Base image for pnpm and application
FROM node:20-alpine AS base

# Install pnpm using corepack
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Set working directory
WORKDIR /app

# Step 2: Install dependencies
FROM base AS deps
COPY package.json ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

# Step 3: Build Next.js application in standalone mode and generate Prisma client
FROM base AS build

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

COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm prisma generate
RUN pnpm run build

# Step 4: Production image (Standalone Mode)
FROM node:20-alpine AS runner

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy necessary files
COPY --from=build /app/next.config.ts ./
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

# Copy standalone build and node_modules
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma files
COPY --from=build /app/prisma ./prisma



# Switch to non-root user
USER nextjs

# Expose port used by the application
EXPOSE 9000

ENV PORT 9000
ENV HOSTNAME "0.0.0.0"

# Run the application in standalone mode
CMD ["node", "server.js"]