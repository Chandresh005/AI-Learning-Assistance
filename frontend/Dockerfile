# Stage 1: Build the Next.js application on Debian glibc
FROM node:20-bookworm-slim AS builder
WORKDIR /app

COPY package.json ./
RUN npm install --include=dev --no-audit --no-fund

COPY . .
RUN rm -f package-lock.json

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# Stage 2: Production runner
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000

CMD ["sh", "-c", "npx next start -H 0.0.0.0 -p ${PORT:-3000}"]
