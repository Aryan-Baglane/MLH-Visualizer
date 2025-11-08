# Multi-stage Dockerfile
# ----------------------
# Stage 1 — Build the Vite frontend
FROM node:20-alpine AS builder
WORKDIR /app

# Copy manifest files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev)
RUN npm install --silent

# Copy the rest of the source code
COPY . .

# Build the frontend
RUN npm run build

# ----------------------
# Stage 2 — Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/server ./server
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# ✅ Use npm install (not ci) since we may not have lockfile in final stage
RUN npm install --only=production --silent

EXPOSE 3001
CMD ["node", "server/index.js"]
