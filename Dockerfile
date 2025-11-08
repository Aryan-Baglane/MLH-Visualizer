# Multi-stage Dockerfile
# Builder stage: install deps and build the Vite app
FROM node:20-alpine AS builder
WORKDIR /app

# copy package manifest first to leverage docker layer cache
COPY package.json package-lock.json* ./
# copy everything (we need source to build)
COPY . .

# Install dependencies and build
RUN npm ci --silent
RUN npm run build

# Runner stage: only production deps + built assets + server
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy server code and built frontend
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Install production dependencies only
RUN npm ci --only=production --silent

EXPOSE 3001
CMD ["node", "server/index.js"]
