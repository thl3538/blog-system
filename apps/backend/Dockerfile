FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY apps/backend/package*.json ./apps/backend/
RUN npm ci --workspace backend --include-workspace-root=false

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/backend/package*.json ./apps/backend/
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app/apps/backend
ENV NODE_ENV=production

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/apps/backend/package.json ./package.json

EXPOSE 3000
CMD ["node", "dist/main"]
