# Multi-stage Dockerfile para Portal Suzuki React + Node.js Backend

# ---------- STAGE 1: Build Frontend (Vite + React) ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- STAGE 2: Production Server ----------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json ./
RUN npm ci --only=production

# Copia o build estático do React e o backend Node.js
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

EXPOSE 3000

CMD ["node", "server/index.js"]
