# --- Step 1: Build the app ---
FROM node:25.1.0-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build using standalone mode
RUN npm run build

# --- Step 2: Serve with Next.js standalone output ---
FROM node:25.1.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy only necessary files for runtime
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.ts ./next.config.ts

EXPOSE 3001

CMD ["npx", "next", "start", "-p", "3004"]