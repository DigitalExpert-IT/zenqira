FROM --platform=linux/amd64 node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
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

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED 1
RUN yarn prisma generate
RUN yarn build

# If using npm comment out above and use below instead
# RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# RUN addgroup --system --gid 1001 nodejs
# RUN adduser --system --uid 1001 nextjs

RUN addgroup -S -g 1001 nodejs
RUN adduser -S -u 1001 -G nodejs nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY prisma /app/prisma

USER nextjs

ENV PORT 80
CMD ["node", "server.js"]