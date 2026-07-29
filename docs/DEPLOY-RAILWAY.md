# Deploy on Railway (and publish a one-click template)

WhaTicket is a **monorepo with two apps** — `backend/` and `frontend/` — plus a
database. Pointing Railway at the repository root fails in a few seconds
("Failed to build an image") because the root has **no** app to build (no root
`package.json` / `Dockerfile`, only the two subfolders, each with its own
`Dockerfile`).

The fix is to create **one Railway service per app**, each with its **Root
Directory** set to the right subfolder. The backend ships a `railway.json` that
points Railway at an **optimized `Dockerfile.railway`** (Node 18, no Chrome, no
EOL-Debian apt) — so the backend build is small and fast. The frontend uses its
own `frontend/Dockerfile`. Once done, you can turn the finished project into a
**public template** with a one-click *Deploy on Railway* button.

## Service topology

| Service | Root Directory | Builder | Notes |
| --- | --- | --- | --- |
| **MySQL** | — | Railway plugin | `New → Database → Add MySQL` |
| **Redis** | — | Railway plugin | `New → Database → Add Redis` (used for sessions/sockets) |
| **backend** | `backend` | `backend/Dockerfile.railway` (via `railway.json`) — Node 18, no Chrome | REST API + WhatsApp provider + webhook |
| **frontend** | `frontend` | `frontend/Dockerfile` | React/Vite app served by nginx |

> `backend/railway.json` sets `dockerfilePath: Dockerfile.railway`, so with Root
> Directory `backend` Railway builds the optimized image automatically. The
> original `backend/Dockerfile` (with Chrome, for the `wwebjs` provider) is left
> untouched and is still what the VPS `docker-compose` uses.

## Step by step (first deploy)

1. **Create the project** → `New Project → Deploy from GitHub repo` → pick this fork.
2. This first service is the **backend** — set its **Settings → Root Directory**
   to `backend`. Railway reads `backend/railway.json` and builds the optimized
   `Dockerfile.railway` (Node 18, no Chrome).
3. **Add MySQL:** `New → Database → Add MySQL`.
4. **Add Redis:** `New → Database → Add Redis`.
5. **Add the frontend service:** `New → GitHub Repo` (same repo) → Settings →
   **Root Directory** = `frontend`.
6. Set the environment variables on each service — paste the **copy-paste blocks
   below** into each service's **Variables → Raw Editor**.
7. On the **backend** service, open **Settings → Networking → Generate Domain**
   (and do the same for **frontend**). Put those public URLs into `BACKEND_URL` /
   `FRONTEND_URL` and `REACT_APP_BACKEND_URL`.
8. Redeploy. The backend waits for MySQL and runs DB migrations automatically on
   boot (part of the `Dockerfile.railway` `CMD`).

## Environment variables

Use Railway **reference variables** (`${{Service.VAR}}`) so the template wires
itself up without hardcoded secrets.

### backend service

| Variable | Value |
| --- | --- |
| `WHATSAPP_PROVIDER` | `wame` |
| `WAME_WEBHOOK_SECRET` | a strong random string |
| `DB_DIALECT` | `mysql` |
| `DB_HOST` | `${{MySQL.MYSQLHOST}}` |
| `DB_PORT` | `${{MySQL.MYSQLPORT}}` |
| `DB_NAME` | `${{MySQL.MYSQLDATABASE}}` |
| `DB_USER` | `${{MySQL.MYSQLUSER}}` |
| `DB_PASS` | `${{MySQL.MYSQLPASSWORD}}` |
| `IO_REDIS_SERVER` | `${{Redis.REDISHOST}}` |
| `IO_REDIS_PORT` | `${{Redis.REDISPORT}}` |
| `IO_REDIS_PASSWORD` | `${{Redis.REDISPASSWORD}}` |
| `JWT_SECRET` | random string |
| `JWT_REFRESH_SECRET` | random string |
| `BACKEND_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` |
| `FRONTEND_URL` | the frontend service's public URL |

> `PORT` is injected by Railway automatically and the backend already listens on
> `process.env.PORT` — do **not** hardcode it.

**Copy-paste (backend → Variables → Raw Editor):**

```dotenv
WHATSAPP_PROVIDER=wame
WAME_WEBHOOK_SECRET=change-me-strong-secret
DB_DIALECT=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASS=${{MySQL.MYSQLPASSWORD}}
IO_REDIS_SERVER=${{Redis.REDISHOST}}
IO_REDIS_PORT=${{Redis.REDISPORT}}
IO_REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
JWT_SECRET=change-me-random
JWT_REFRESH_SECRET=change-me-another-random
BACKEND_URL=https://${{RAILWAY_PUBLIC_DOMAIN}}
FRONTEND_URL=https://REPLACE-WITH-FRONTEND-DOMAIN
```

### frontend service

| Variable | Value |
| --- | --- |
| `REACT_APP_BACKEND_URL` | the backend service's public URL |
| `REACT_APP_WHATSAPP_PROVIDER` | `wame` |

> The frontend injects `REACT_APP_*` at runtime (via
> `.docker/add-env-vars.sh`), so these can be set on the service without
> rebuilding.

**Copy-paste (frontend → Variables → Raw Editor):**

```dotenv
REACT_APP_BACKEND_URL=https://REPLACE-WITH-BACKEND-DOMAIN
REACT_APP_WHATSAPP_PROVIDER=wame
```

> Railway's **Raw Editor** (Variables tab) lets you paste a whole `KEY=VALUE`
> block at once. The `${{MySQL.*}}` / `${{Redis.*}}` references resolve
> automatically once those database services exist in the project. Replace the
> `REPLACE-WITH-*` domains after you generate each service's public domain.

## wame provider + webhook

Because the backend gets a **public HTTPS domain** on Railway, you don't need a
tunnel (ngrok/cloudflared) — set `BACKEND_URL` to that domain and the `wame`
provider registers its webhook at
`https://<backend-domain>/wame/webhook/<whatsappId>?token=<WAME_WEBHOOK_SECRET>`
automatically when a connection starts.

## Publish it as a public template (shareable, one-click)

Once the project runs end to end:

1. Railway dashboard → your project → **Settings → Create Template** (or the
   project's ⋯ menu → *Create Template*).
2. Railway reads the current services, their Root Directories, and the
   environment variables (secret values are turned into inputs the deployer
   fills in). Review and **Publish**.
3. You get a public template URL like `https://railway.com/template/XXXXXX` and a
   badge. Add the button to the README:

```markdown
[![Deploy on Railway](https://railway.com/button.svg)](https://railway.com/template/XXXXXX)
```

Anyone can then click it and get their own WhaTicket + wame stack (MySQL + Redis
+ backend + frontend) provisioned automatically — great for sharing and for
promoting the wame.api.br integration.

## Gotchas

- The "Failed to build an image" (root ambiguity) error is solved by setting each
  service's Root Directory (`backend` / `frontend`).
- `backend/Dockerfile.railway` (used on Railway) does **not** install Chrome and
  runs on Node 18 — the `wame` provider never launches a browser, and Node 18's
  npm is far faster than node:14's npm 6. The original `backend/Dockerfile` (with
  Chrome, for `wwebjs` / the VPS `docker-compose`) was also fixed to use
  `archive.debian.org` since Node 14's Debian "buster" repos are EOL and 404.
- The backend waits for MySQL and runs migrations on boot — make sure the `DB_*`
  variables are set or boot will keep retrying.
- Frontend Vite output dir is `build` (set in `vite.config.js`), which matches
  the frontend Dockerfile — don't change one without the other.
- The frontend nginx `upstream backend` block only renders when `URL_BACKEND` is
  set, so the frontend deploys fine on Railway without it (the browser talks to
  the backend directly via `REACT_APP_BACKEND_URL`).
