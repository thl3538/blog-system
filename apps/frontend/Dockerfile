FROM node:22-alpine AS deps
WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
RUN npm ci --workspace frontend --include-workspace-root=false

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/package*.json ./apps/frontend/
COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend
RUN npm run build

FROM nginx:1.27-alpine AS runner
COPY apps/frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
