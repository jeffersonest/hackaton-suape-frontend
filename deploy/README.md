# Deploy (VPS) — frontend Suape

Deploy **pull-based**: o CI (`.github/workflows/deploy.yml`) builda a imagem Next
(standalone) com `NEXT_PUBLIC_API_URL=https://api.almirante.chat` embutido e
publica no GHCR; a VPS roda um **systemd timer** que puxa a `:latest` e recria o
container a cada 2 min. Sem SSH de entrada do GitHub.

Domínio: **almirante.chat** / **www.almirante.chat** → `127.0.0.1:3003` (nginx do
host faz TLS/proxy).

## Setup one-time na VPS

```bash
mkdir -p /opt/suape_frontend
# copie docker-compose.prod.yml e deploy/ para /opt/suape_frontend
# (opcional) /opt/suape_frontend/.env com FRONTEND_PORT=3003

cd /opt/suape_frontend
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# nginx + TLS
cp deploy/nginx-almirante.chat.conf /etc/nginx/sites-available/suape-web.conf
ln -s /etc/nginx/sites-available/suape-web.conf /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
certbot --nginx -d almirante.chat -d www.almirante.chat

# timer de auto-deploy
cp deploy/suape-frontend-deploy.service /etc/systemd/system/
cp deploy/suape-frontend-deploy.timer /etc/systemd/system/
chmod +x deploy/suape-frontend-deploy.sh
systemctl daemon-reload
systemctl enable --now suape-frontend-deploy.timer
```

> A `NEXT_PUBLIC_API_URL` é **build-time**: se a URL da API mudar, atualize o
> `build-args` no workflow e refaça o build.
