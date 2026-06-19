#!/bin/bash
# Pull-based deploy: a VPS puxa a imagem que o CI publicou no GHCR e recria o
# container. Roda via systemd timer (suape-frontend-deploy.timer). Idempotente.
set -euo pipefail

cd /opt/suape_frontend

COMPOSE="docker compose -f docker-compose.prod.yml"

$COMPOSE pull web 2>&1 | tail -3
$COMPOSE up -d web 2>&1 | tail -3

PORT="${FRONTEND_PORT:-3003}"
for i in $(seq 1 20); do
  if curl -fsS "http://127.0.0.1:${PORT}/" >/dev/null 2>&1; then
    echo "$(date -Is) deploy OK (tentativa $i)"
    exit 0
  fi
  sleep 3
done

echo "$(date -Is) HEALTH FAILED apos ~60s"
$COMPOSE logs --tail=50 web
exit 1
