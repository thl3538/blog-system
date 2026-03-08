#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f apps/backend/.env.production ]]; then
  echo "[deploy] Missing apps/backend/.env.production"
  echo "[deploy] Run: cp apps/backend/.env.production.example apps/backend/.env.production"
  exit 1
fi

if [[ ! -f apps/frontend/.env.production ]]; then
  echo "[deploy] Missing apps/frontend/.env.production"
  echo "[deploy] Run: cp apps/frontend/.env.production.example apps/frontend/.env.production"
  exit 1
fi

echo "[deploy] Starting deployment with docker-compose.deploy.yml ..."
docker compose -f docker-compose.deploy.yml up -d --build

echo "[deploy] Syncing database schema (prisma db push) ..."
docker compose -f docker-compose.deploy.yml exec -T backend npx prisma db push || true

echo "[deploy] Done"
echo "[deploy] Frontend: http://localhost:8080"
echo "[deploy] Backend:  http://localhost:3000/api/health"
