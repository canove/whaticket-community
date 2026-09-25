<p align="center">
  <a href="https://whaticket.com/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=en-logo" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="images/whaticket-logo-white.png">
      <img src="images/whaticket-logo-black.png" width="300" alt="Whaticket">
    </picture>
  </a>
</p>

<h1 align="center">Whaticket Open Source</h1>

<p align="center">
  <strong>The open-source WhatsApp ticketing system that Whaticket grew out of.</strong><br>
  Several agents on one WhatsApp number. Every conversation becomes a ticket.
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-3956FF.svg"></a>
  <a href="https://github.com/canove/whaticket/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/canove/whaticket?color=3956FF"></a>
  <a href="https://discord.gg/Dp2tTZRYHg"><img alt="Discord" src="https://img.shields.io/discord/784109818247774249?logo=discord&logoColor=white&label=discord&color=3956FF"></a>
  <a href="https://whaticket.com/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=en-badge"><img alt="Whaticket" src="https://img.shields.io/badge/whaticket.com-3956FF"></a>
</p>

<p align="center">
  <b>English</b> · <a href="README.pt-br.md">Português</a> · <a href="README.es.md">Español</a>
</p>

<p align="center">
  <a href="#what-is-this">What is this</a> ·
  <a href="#open-source-vs-whaticket">Open Source vs Whaticket</a> ·
  <a href="#screenshots">Screenshots</a> ·
  <a href="#quick-start-with-docker">Quick start</a> ·
  <a href="#configuration">Configuration</a> ·
  <a href="#project-status">Project status</a>
</p>

---

## What is this

In 2020 this repository was a weekend experiment: turn WhatsApp messages into support
tickets so a whole team could answer from a single number. It became one of the most forked
WhatsApp helpdesk projects on GitHub, and it grew into **[Whaticket](https://whaticket.com/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=en-intro)**, the commercial
platform that today serves **4,500+ companies** across Latin America.

This repo is **Whaticket Open Source**: the original codebase, under an MIT license. You can
self-host it, fork it and build on top of it. The code the company started from stays public.

**Backend**: Node.js + TypeScript + Express + Sequelize. It talks to WhatsApp through a
pluggable provider layer ([whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
or [zapo-js](https://github.com/vinikjkkj/zapo)) and stores everything in MySQL/MariaDB.

**Frontend**: a React + Material UI chat app built with Vite. It communicates with the
backend over REST and WebSockets, in English, Portuguese and Spanish.

> [!NOTE]
> **Prefer not to run servers?** [Whaticket](https://whaticket.com/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=en-product-callout) is the managed
> product built by the same team. It works with the official WhatsApp API and brings
> Instagram, Facebook, TikTok, Telegram and web chat into one inbox, with AI chatbots,
> campaigns and 24/7 support.
> [14-day free trial, no credit card](https://whaticket.com/precios/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=en-trial).

## Open Source vs Whaticket

Both are built by the same team. The difference is how much infrastructure you want to run.

| | **Whaticket Open Source** | **[Whaticket](https://whaticket.com/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=en-comparison-table)** |
|---|:---:|:---:|
| License / price | MIT, free forever | From US$49/month for 3 users |
| Hosting, updates, backups | You run it | Managed for you |
| WhatsApp via QR code | ✅ | ✅ |
| Official WhatsApp Cloud API | ❌ | ✅ |
| Multiple agents on one number | ✅ | ✅ |
| Multiple WhatsApp connections | ✅ | ✅ |
| Queues / departments | ✅ | ✅ |
| Quick replies | ✅ | ✅ |
| Media messages (image/audio/video/files) | ✅ | ✅ |
| Instagram, Facebook, TikTok, Telegram, web chat | ❌ | ✅ |
| Rule-based and AI chatbots (Wäbot) | ❌ | ✅ |
| Bulk campaigns | ❌ | ✅ |
| Analytics, CSAT and performance reports | Basic dashboard | ✅ |
| Integrations (Zapier, Shopify, Slack, Google…) | ❌ | ✅ |
| Mobile apps (iOS / Android) | ❌ | ✅ |
| Support | Community, on [Discord](https://discord.gg/Dp2tTZRYHg) and issues | 24/7 over WhatsApp |

The commercial plan starts at 3 users, which comes to about US$16 per user per month.

## Screenshots

<p align="center">
  <img src="images/whaticket-queues.gif" width="720" alt="Ticket queues">
</p>

<table>
  <tr>
    <td width="50%"><img src="images/chat2.png" alt="Ticket conversation"></td>
    <td width="50%"><img src="images/chat3.png" alt="Chat with contact"></td>
  </tr>
  <tr>
    <td align="center"><sub>Ticket conversation</sub></td>
    <td align="center"><sub>Agent chat view</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="images/multiple-whatsapps2.png" alt="Multiple WhatsApp connections"></td>
    <td width="50%"><img src="images/contacts1.png" alt="Contacts"></td>
  </tr>
  <tr>
    <td align="center"><sub>Multiple WhatsApp connections</sub></td>
    <td align="center"><sub>Contact management</sub></td>
  </tr>
</table>

## Features

- 💬 **Shared inbox**: several agents answering from the same WhatsApp number
- 📱 **Multiple connections**: link more than one WhatsApp account, receive it all in one place
- 🎫 **Ticket lifecycle**: pending → open → resolved, with assignment per agent
- 🏷️ **Queues**: route incoming conversations to the right department
- ⚡ **Quick replies**: canned answers for the questions you get every day
- 🖼️ **Media**: send and receive images, audio, video and documents
- 👥 **Contacts**: start conversations with new contacts without touching the phone
- 📊 **Dashboard**: ticket and agent activity at a glance
- 🔌 **Pluggable WhatsApp provider**: `whatsapp-web.js` (Puppeteer) or `zapo` (WebSocket)
- 🌍 **i18n**: English, Portuguese and Spanish out of the box

### How tickets work

Every new message on a connected WhatsApp number creates a **Ticket**. Tickets land in a
queue on the *Tickets* page, where an agent **accepts** one, answers it, and eventually
**resolves** it.

Follow-up messages from the same contact attach to the first **open/pending** ticket found.
If a contact writes again within 2 hours and has no pending or open ticket, the most recent
**closed** ticket is reopened instead of a new one being created.

## Requirements

- **Node.js 14+** for the `wwebjs` provider, **Node.js 22+** for the `zapo` provider
  (the backend CI and Dockerfile build on Node 22)
- **MySQL 5.7+ or MariaDB 10.6+**
- **Docker** (optional, but the fastest way to get a database up)
- A Linux server if you are deploying to production. Ubuntu 20.04+ is what these
  instructions assume.

> [!WARNING]
> The QR-code providers used here are **unofficial** WhatsApp clients. WhatsApp does not
> allow bots or unofficial clients on their platform, and numbers connected this way can be
> blocked. The supported alternative is the official WhatsApp Cloud API, which
> [Whaticket](https://whaticket.com/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=en-ban-warning) provides.

## Quick start with Docker

```bash
git clone https://github.com/canove/whaticket.git
cd whaticket
cp .env.example .env
```

Edit `.env`. At minimum, set `MYSQL_ROOT_PASSWORD`, `JWT_SECRET` and `JWT_REFRESH_SECRET`:

```bash
# MYSQL
MYSQL_ENGINE=mariadb
MYSQL_VERSION=10.6
MYSQL_ROOT_PASSWORD=change-me
MYSQL_DATABASE=whaticket
MYSQL_PORT=3306
TZ=America/Fortaleza

# BACKEND
BACKEND_PORT=8080
BACKEND_SERVER_NAME=api.mydomain.com
BACKEND_URL=https://api.mydomain.com
PROXY_PORT=443
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me-too

# FRONTEND
FRONTEND_PORT=80
FRONTEND_SSL_PORT=443
FRONTEND_SERVER_NAME=myapp.mydomain.com
FRONTEND_URL=https://myapp.mydomain.com
```

Bring everything up:

```bash
docker-compose up -d --build
```

On the **first run only**, seed the database:

```bash
docker-compose exec backend npx sequelize db:seed:all
```

Open the frontend, log in with the seeded account, go to **Connections**, create your first
WhatsApp connection and scan the QR code. Every message that number receives now shows up in
the ticket list.

**Default credentials:** `admin@whaticket.com` / `admin`. Change them immediately.

<details>
<summary><b>Optional Docker services</b></summary>

phpMyAdmin, to inspect the database (port `9000` by default, configurable with `PMA_PORT`):

```bash
docker-compose -f docker-compose.phpmyadmin.yaml up -d
```

Browserless, to run Chrome outside the backend container (set `MAX_CONCURRENT_SESSIONS`):

```bash
docker-compose -f docker-compose.browserless.yaml up -d
```

</details>

<details>
<summary><b>SSL certificates for the Docker setup</b></summary>

Drop your certificates into `ssl/certs`, with one folder per service:

```
.
├── certs
│   ├── backend
│   │   ├── fullchain.pem
│   │   └── privkey.pem
│   └── frontend
│       ├── fullchain.pem
│       └── privkey.pem
└── www
```

The frontend nginx container is already set up to answer certbot's webroot challenge:

```bash
certbot certonly --cert-name backend  --webroot --webroot-path ./ssl/www/ -d api.mydomain.com
certbot certonly --cert-name frontend --webroot --webroot-path ./ssl/www/ -d myapp.mydomain.com
```

</details>

## Running locally for development

<details>
<summary><b>Step-by-step development setup</b></summary>

**1. Start a database**

```bash
docker run --name whaticketdb \
  -e MYSQL_ROOT_PASSWORD=strongpassword \
  -e MYSQL_DATABASE=whaticket \
  -e MYSQL_USER=whaticket \
  -e MYSQL_PASSWORD=whaticket \
  --restart always -p 3306:3306 -d mariadb:10.6 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_bin
```

**2. Install Puppeteer's system dependencies** (only needed for the `wwebjs` provider):

```bash
sudo apt-get install -y libxshmfence-dev libgbm-dev wget unzip fontconfig locales gconf-service \
  libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 \
  libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
  libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
  libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates \
  fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

**3. Backend**

```bash
cd backend
cp .env.example .env   # then fill it in, see Configuration below
npm install
npm run build
npx sequelize db:migrate
npx sequelize db:seed:all
npm run dev            # or: npm start
```

**4. Frontend**, in a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

`frontend/.env` only needs to point at the backend:

```bash
VITE_BACKEND_URL = http://localhost:8080/
```

**5.** Open <http://localhost:3000/signup>, create a user, then go to **Connections** and
scan the QR code.

</details>

## Production deployment on a VPS

<details>
<summary><b>Ubuntu 20.04 + pm2 + nginx + Let's Encrypt</b></summary>

These steps assume you are **not** running as root, since Puppeteer refuses to start as root.
Point two subdomains at your server first; this walkthrough uses `myapp.mydomain.com` for the
frontend and `api.mydomain.com` for the backend.

**Create a deploy user**

```bash
adduser deploy
usermod -aG sudo deploy
su deploy
```

**Install Node and Docker**

```bash
sudo apt update && sudo apt upgrade -y

curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"
sudo apt update && sudo apt install -y docker-ce
sudo usermod -aG docker ${USER}
su - ${USER}
```

**Database, code and backend**

```bash
docker run --name whaticketdb \
  -e MYSQL_ROOT_PASSWORD=strongpassword -e MYSQL_DATABASE=whaticket \
  -e MYSQL_USER=whaticket -e MYSQL_PASSWORD=whaticket \
  --restart always -p 3306:3306 -d mariadb:10.6 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_bin

cd ~ && git clone https://github.com/canove/whaticket.git whaticket
cp whaticket/backend/.env.example whaticket/backend/.env
nano whaticket/backend/.env    # use https:// URLs and PROXY_PORT=443

cd whaticket/backend
npm install
npm run build
npx sequelize db:migrate
npx sequelize db:seed:all
```

Confirm it boots with `npm start` (you should see `Server started on port...`), stop it with
`CTRL + C`, then hand it to pm2:

```bash
sudo npm install -g pm2
pm2 start dist/server.js --name whaticket-backend
pm2 startup ubuntu -u $USER     # run the command it prints back
```

**Frontend**

```bash
cd ../frontend
npm install
echo "VITE_BACKEND_URL = https://api.mydomain.com/" > .env
npm run build
pm2 start server.js --name whaticket-frontend
pm2 save
```

**nginx**

```bash
sudo apt install -y nginx
sudo rm /etc/nginx/sites-enabled/default
sudo nano /etc/nginx/sites-available/whaticket-frontend
```

```nginx
server {
  server_name myapp.mydomain.com;

  location / {
    proxy_pass http://127.0.0.1:3333;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }
}
```

Copy it for the backend, changing `server_name` to `api.mydomain.com` and `proxy_pass` to
`http://127.0.0.1:8080`, then enable both:

```bash
sudo cp /etc/nginx/sites-available/whaticket-frontend /etc/nginx/sites-available/whaticket-backend
sudo nano /etc/nginx/sites-available/whaticket-backend
sudo ln -s /etc/nginx/sites-available/whaticket-frontend /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/whaticket-backend  /etc/nginx/sites-enabled
```

nginx caps request bodies at 1MB, which is too small for media uploads. In
`/etc/nginx/nginx.conf`, inside the `http { }` block:

```nginx
client_max_body_size 20M;
```

```bash
sudo nginx -t && sudo service nginx restart
```

**HTTPS**, required for notifications and audio messages:

```bash
sudo snap install --classic certbot
sudo certbot --nginx
```

</details>

## Configuration

### Backend (`backend/.env`)

| Variable | Description | Default |
|---|---|---|
| `WHATSAPP_PROVIDER` | WhatsApp driver: `wwebjs` or `zapo` | `wwebjs` |
| `NODE_ENV` | `DEVELOPMENT` gives you verbose debugging | |
| `PORT` | Port the backend listens on | `8080` |
| `PROXY_PORT` | Public port behind your reverse proxy (`443` in production) | `8080` |
| `BACKEND_URL` | Public backend URL | `http://localhost:8080` |
| `FRONTEND_URL` | Public frontend URL. **CORS depends on this** | `http://localhost:3000` |
| `DB_HOST` / `DB_PORT` | Database host and port | `localhost` / `3306` |
| `DB_DIALECT` | `mysql` | `mysql` |
| `DB_NAME` / `DB_USER` / `DB_PASS` | Database credentials | |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Token signing secrets, **change these** | |
| `CHROME_BIN` / `CHROME_WS` / `CHROME_ARGS` | Puppeteer/Chrome settings (`wwebjs` only) | |
| `LOG_LEVEL` | `silent`, `fatal`, `error`, `warn`, `info`, `debug`, `trace` | `info` |
| `ZAPO_LOG_LEVEL` | Log level for the `zapo` provider | `error` |
| `ZAPO_AUTH_PATH` | SQLite file where the `zapo` provider keeps session state | `.zapo_auth/state.sqlite` |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_BACKEND_URL` | Backend URL the app talks to |
| `VITE_HOURS_CLOSE_TICKETS_AUTO` | Hours of inactivity before tickets auto-close |

### Choosing a WhatsApp provider

| | `wwebjs` | `zapo` |
|---|---|---|
| How it connects | Puppeteer driving WhatsApp Web | Direct WebSocket protocol |
| Memory footprint | Heavy, one Chrome per session | Light |
| System dependencies | Chrome + many `lib*` packages | Node 22+ and SQLite (`better-sqlite3`) |
| Maturity in this repo | Default, in production for years | Newer, in active development |

Switch between them with `WHATSAPP_PROVIDER` in `backend/.env`.

The `zapo` provider uploads media without any extra dependency, but thumbnails, media
dimensions and voice-note waveforms come from the optional `@zapo-js/media-utils` package
(which needs `ffmpeg`/`ffprobe` and `sharp`). Install it and the provider picks it up on the
next restart; without it media still sends, just without previews.

## Updating an existing installation

Always diff `.env.example` against your `.env` before upgrading. New variables show up there
first.

```bash
#!/bin/bash
echo "Updating Whaticket, please wait."

cd ~/whaticket
git pull

cd backend
npm install
rm -rf dist
npm run build
npx sequelize db:migrate
npx sequelize db:seed

cd ../frontend
npm install
rm -rf build
npm run build

pm2 restart all
echo "Update finished. Enjoy!"
```

### Coming from the `whaileys` provider

The `whaileys` provider was replaced by `zapo`. Connections paired under `whaileys` carry
over on their own, without scanning a new QR code:

1. Move the server to Node.js 22+ (a `better-sqlite3` requirement).
2. Optionally, set `WHATSAPP_PROVIDER=zapo` in `backend/.env`. The old `whaileys` value keeps
   working and points to the same provider.
3. Run the update script above. When the backend restarts, each connection's session is copied
   from the database into `.zapo_auth/state.sqlite` and the connection comes back without a new
   QR code.

The copy reads the `session` column of `Whatsapps` and the `WppKeys` table, so keep `WppKeys`
until every connection is back online. Redis is no longer read and can be turned off. A
connection whose session can't be copied shows a new QR code, like a fresh pairing.

## Project status

**Maintenance mode, with active development returning.**

For the last few years this repository has received security and dependency patches while
the team's effort went into the commercial platform. That is changing: we are planning a
return to regular feature work here. Recent commits are the first steps: the frontend moved
to Vite, and the WhatsApp integration moved to a pluggable provider layer with the new
[zapo-js](https://github.com/vinikjkkj/zapo) driver.

What that means for you today:

- Issues and pull requests are read. Reviews may be slow.
- The codebase is stable and widely deployed, but expect rough edges and dated dependencies.
- Breaking changes will be called out in release notes.

If you depend on this project, [tell us on Discord](https://discord.gg/Dp2tTZRYHg) what you
need most. That is what shapes the priorities.

## Contributing

Pull requests are welcome: bug fixes, dependency upgrades, documentation and translations.
For anything large, open an issue first so we can agree on the approach.

- 💬 [Discord](https://discord.gg/Dp2tTZRYHg): questions and discussion
- 🐛 [Issues](https://github.com/canove/whaticket/issues): bugs and feature requests

## Related projects

- **[zapo-js](https://github.com/vinikjkkj/zapo)**: the WhatsApp WebSocket library used by
  the `zapo` provider
- **[Whaticket](https://whaticket.com/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=en-related-projects)**: the managed commercial platform

## License

[MIT](LICENSE) © Whaticket and contributors.

## Disclaimer

This project is not affiliated with, associated with, authorized by, endorsed by, or in any
way officially connected to WhatsApp or any of its subsidiaries or affiliates. The official
WhatsApp website is <https://whatsapp.com>. "WhatsApp" and related names, marks, emblems and
images are registered trademarks of their respective owners.

Using unofficial clients to connect to WhatsApp can get your number blocked. Run this
software at your own risk, and review it against your own security requirements before
exposing it to the internet.
