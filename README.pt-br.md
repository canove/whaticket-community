<p align="center">
  <a href="https://whaticket.com/pt/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=pt-logo" target="_blank">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="images/whaticket-logo-white.png">
      <img src="images/whaticket-logo-black.png" width="300" alt="Whaticket">
    </picture>
  </a>
</p>

<h1 align="center">Whaticket Open Source</h1>

<p align="center">
  <strong>O sistema de atendimento por WhatsApp, open source, que deu origem à Whaticket.</strong><br>
  Vários atendentes em um número só. Cada conversa vira um ticket.
</p>

<p align="center">
  <a href="LICENSE"><img alt="Licença: MIT" src="https://img.shields.io/badge/license-MIT-3956FF.svg"></a>
  <a href="https://github.com/canove/whaticket/stargazers"><img alt="Stars" src="https://img.shields.io/github/stars/canove/whaticket?color=3956FF"></a>
  <a href="https://discord.gg/Dp2tTZRYHg"><img alt="Discord" src="https://img.shields.io/discord/784109818247774249?logo=discord&logoColor=white&label=discord&color=3956FF"></a>
  <a href="https://whaticket.com/pt/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=pt-badge"><img alt="Whaticket" src="https://img.shields.io/badge/whaticket.com-3956FF"></a>
</p>

<p align="center">
  <a href="README.md">English</a> · <b>Português</b> · <a href="README.es.md">Español</a>
</p>

<p align="center">
  <a href="#o-que-é-isso">O que é isso</a> ·
  <a href="#open-source-vs-whaticket">Open Source vs Whaticket</a> ·
  <a href="#capturas-de-tela">Capturas de tela</a> ·
  <a href="#início-rápido-com-docker">Início rápido</a> ·
  <a href="#configuração">Configuração</a> ·
  <a href="#status-do-projeto">Status do projeto</a>
</p>

---

## O que é isso

Em 2020 este repositório era um experimento de fim de semana: transformar mensagens de
WhatsApp em tickets de atendimento para que um time inteiro pudesse responder a partir de um
único número. Virou um dos projetos de helpdesk para WhatsApp mais forkados do GitHub, e deu
origem à **[Whaticket](https://whaticket.com/pt/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=pt-intro)**, a plataforma comercial que hoje
atende **mais de 4.500 empresas** na América Latina.

Este repositório guarda o **Whaticket Open Source**: o código original, sob licença MIT. Você
pode hospedar por conta própria, forkar e construir em cima. O código do qual a empresa nasceu
segue público.

**Backend**: Node.js + TypeScript + Express + Sequelize. Conversa com o WhatsApp através
de uma camada de providers plugável ([whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
ou [whaileys](https://github.com/canove/whaileys)) e guarda tudo em MySQL/MariaDB.

**Frontend**: um app de chat em React + Material UI, empacotado com Vite. Fala com o backend
via REST e WebSockets, em português, inglês e espanhol.

> [!NOTE]
> **Prefere não administrar servidor?** A [Whaticket](https://whaticket.com/pt/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=pt-product-callout) é a
> plataforma gerenciada feita pelo mesmo time. Trabalha com a API oficial do WhatsApp e reúne
> Instagram, Facebook, TikTok, Telegram e webchat na mesma caixa de entrada, com chatbots de
> IA, campanhas e suporte 24/7. [14 dias grátis, sem cartão de crédito](https://whaticket.com/pt/precos/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=pt-trial).

## Open Source vs Whaticket

As duas são feitas pelo mesmo time. A diferença está em quanta infraestrutura você quer
administrar.

| | **Whaticket Open Source** | **[Whaticket](https://whaticket.com/pt/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=pt-comparison-table)** |
|---|:---:|:---:|
| Licença / preço | MIT, grátis para sempre | A partir de US$ 49/mês (R$ 270) para 3 usuários |
| Hospedagem, atualizações, backups | Por sua conta | Gerenciado |
| WhatsApp via QR Code | ✅ | ✅ |
| API oficial do WhatsApp (Cloud API) | ❌ | ✅ |
| Vários atendentes no mesmo número | ✅ | ✅ |
| Múltiplas conexões de WhatsApp | ✅ | ✅ |
| Filas / departamentos | ✅ | ✅ |
| Respostas rápidas | ✅ | ✅ |
| Mídias (imagem/áudio/vídeo/arquivos) | ✅ | ✅ |
| Instagram, Facebook, TikTok, Telegram, web chat | ❌ | ✅ |
| Chatbots por regras e com IA (Wäbot) | ❌ | ✅ |
| Campanhas em massa | ❌ | ✅ |
| Relatórios, CSAT e métricas de desempenho | Dashboard básico | ✅ |
| Integrações (Zapier, Shopify, Slack, Google…) | ❌ | ✅ |
| Aplicativos móveis (iOS / Android) | ❌ | ✅ |
| Suporte | Comunidade, no [Discord](https://discord.gg/Dp2tTZRYHg) e nas issues | 24/7 por WhatsApp |

O plano comercial começa em 3 usuários, o que dá cerca de R$ 90 por usuário ao mês.

## Capturas de tela

<p align="center">
  <img src="images/whaticket-queues.gif" width="720" alt="Filas de tickets">
</p>

<table>
  <tr>
    <td width="50%"><img src="images/chat2.png" alt="Conversa de um ticket"></td>
    <td width="50%"><img src="images/chat3.png" alt="Chat com o contato"></td>
  </tr>
  <tr>
    <td align="center"><sub>Conversa de um ticket</sub></td>
    <td align="center"><sub>Visão do atendente</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="images/multiple-whatsapps2.png" alt="Múltiplas conexões de WhatsApp"></td>
    <td width="50%"><img src="images/contacts1.png" alt="Contatos"></td>
  </tr>
  <tr>
    <td align="center"><sub>Múltiplas conexões de WhatsApp</sub></td>
    <td align="center"><sub>Gestão de contatos</sub></td>
  </tr>
</table>

## Funcionalidades

- 💬 **Caixa de entrada compartilhada**: vários atendentes respondendo pelo mesmo número
- 📱 **Múltiplas conexões**: conecte mais de uma conta de WhatsApp e receba tudo num lugar só
- 🎫 **Ciclo de vida do ticket**: pendente → aberto → resolvido, com atribuição por atendente
- 🏷️ **Filas**: direcione as conversas que chegam para o departamento certo
- ⚡ **Respostas rápidas**: mensagens prontas para as perguntas de todo dia
- 🖼️ **Mídias**: envie e receba imagens, áudios, vídeos e documentos
- 👥 **Contatos**: inicie conversas com novos contatos sem pegar no celular
- 📊 **Dashboard**: visão geral de tickets e atividade dos atendentes
- 🔌 **Provider de WhatsApp plugável**: `whatsapp-web.js` (Puppeteer) ou `whaileys` (WebSocket)
- 🌍 **i18n**: português, inglês e espanhol já inclusos

### Como os tickets funcionam

Cada nova mensagem em um número de WhatsApp conectado cria um **Ticket**. Os tickets caem numa
fila na página *Tickets*, onde um atendente **aceita** o ticket, responde e por fim
**resolve**.

Mensagens seguintes do mesmo contato são anexadas ao primeiro ticket **aberto/pendente**
encontrado. Se o contato escrever de novo em menos de 2 horas e não houver nenhum ticket
pendente ou aberto, o ticket **fechado** mais recente é reaberto em vez de um novo ser criado.

## Requisitos

- **Node.js 14+** (a CI compila em Node 14)
- **MySQL 5.7+ ou MariaDB 10.6+**
- **Docker** (opcional, mas é o jeito mais rápido de subir o banco)
- **Redis** (opcional, usado para persistir as chaves de sessão do WhatsApp)
- Um servidor Linux, se for para produção. Estas instruções assumem Ubuntu 20.04+.

> [!WARNING]
> Os providers por QR Code usados aqui são clientes **não oficiais** do WhatsApp. O WhatsApp
> não permite bots nem clientes não oficiais na plataforma, e números conectados assim podem
> ser bloqueados. A alternativa suportada é a API oficial do WhatsApp, que a
> [Whaticket](https://whaticket.com/pt/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=pt-ban-warning) oferece.

## Início rápido com Docker

```bash
git clone https://github.com/canove/whaticket.git
cd whaticket
cp .env.example .env
```

Edite o `.env`. No mínimo, defina `MYSQL_ROOT_PASSWORD`, `JWT_SECRET` e `JWT_REFRESH_SECRET`:

```bash
# MYSQL
MYSQL_ENGINE=mariadb
MYSQL_VERSION=10.6
MYSQL_ROOT_PASSWORD=troque-isso
MYSQL_DATABASE=whaticket
MYSQL_PORT=3306
TZ=America/Fortaleza

# BACKEND
BACKEND_PORT=8080
BACKEND_SERVER_NAME=api.meudominio.com
BACKEND_URL=https://api.meudominio.com
PROXY_PORT=443
JWT_SECRET=troque-isso
JWT_REFRESH_SECRET=troque-isso-tambem

# FRONTEND
FRONTEND_PORT=80
FRONTEND_SSL_PORT=443
FRONTEND_SERVER_NAME=app.meudominio.com
FRONTEND_URL=https://app.meudominio.com
```

Suba tudo:

```bash
docker-compose up -d --build
```

**Apenas na primeira execução**, popule o banco:

```bash
docker-compose exec backend npx sequelize db:seed:all
```

Abra o frontend, entre com a conta criada pelo seed, vá em **Conexões**, crie sua primeira
conexão de WhatsApp e leia o QR Code. A partir daí toda mensagem recebida por aquele número
aparece na lista de tickets.

**Credenciais padrão:** `admin@whaticket.com` / `admin`. Troque imediatamente.

<details>
<summary><b>Serviços Docker opcionais</b></summary>

phpMyAdmin, para inspecionar o banco (porta `9000` por padrão, configurável em `PMA_PORT`):

```bash
docker-compose -f docker-compose.phpmyadmin.yaml up -d
```

Browserless, para rodar o Chrome fora do container do backend (defina `MAX_CONCURRENT_SESSIONS`):

```bash
docker-compose -f docker-compose.browserless.yaml up -d
```

</details>

<details>
<summary><b>Certificados SSL no setup Docker</b></summary>

Coloque seus certificados em `ssl/certs`, com uma pasta por serviço:

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

O container nginx do frontend já está preparado para responder ao desafio webroot do certbot:

```bash
certbot certonly --cert-name backend  --webroot --webroot-path ./ssl/www/ -d api.meudominio.com
certbot certonly --cert-name frontend --webroot --webroot-path ./ssl/www/ -d app.meudominio.com
```

</details>

## Rodando localmente para desenvolvimento

<details>
<summary><b>Passo a passo do ambiente de desenvolvimento</b></summary>

**1. Suba um banco de dados**

```bash
docker run --name whaticketdb \
  -e MYSQL_ROOT_PASSWORD=strongpassword \
  -e MYSQL_DATABASE=whaticket \
  -e MYSQL_USER=whaticket \
  -e MYSQL_PASSWORD=whaticket \
  --restart always -p 3306:3306 -d mariadb:10.6 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_bin
```

**2. Instale as dependências de sistema do Puppeteer** (só necessário para o provider `wwebjs`):

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
cp .env.example .env   # depois preencha, veja Configuração abaixo
npm install
npm run build
npx sequelize db:migrate
npx sequelize db:seed:all
npm run dev            # ou: npm start
```

**4. Frontend**, em um segundo terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

O `frontend/.env` só precisa apontar para o backend:

```bash
VITE_BACKEND_URL = http://localhost:8080/
```

**5.** Abra <http://localhost:3000/signup>, crie um usuário, depois vá em **Conexões** e leia
o QR Code.

</details>

## Deploy em produção numa VPS

<details>
<summary><b>Ubuntu 20.04 + pm2 + nginx + Let's Encrypt</b></summary>

Estes passos assumem que você **não** está como root, porque o Puppeteer se recusa a iniciar
como root. Aponte dois subdomínios para o servidor antes de começar; este passo a passo usa
`app.meudominio.com` para o frontend e `api.meudominio.com` para o backend.

**Crie um usuário de deploy**

```bash
adduser deploy
usermod -aG sudo deploy
su deploy
```

**Instale Node e Docker**

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

**Banco, código e backend**

```bash
docker run --name whaticketdb \
  -e MYSQL_ROOT_PASSWORD=strongpassword -e MYSQL_DATABASE=whaticket \
  -e MYSQL_USER=whaticket -e MYSQL_PASSWORD=whaticket \
  --restart always -p 3306:3306 -d mariadb:10.6 \
  --character-set-server=utf8mb4 --collation-server=utf8mb4_bin

cd ~ && git clone https://github.com/canove/whaticket.git whaticket
cp whaticket/backend/.env.example whaticket/backend/.env
nano whaticket/backend/.env    # use URLs https:// e PROXY_PORT=443

cd whaticket/backend
npm install
npm run build
npx sequelize db:migrate
npx sequelize db:seed:all
```

Confirme que sobe com `npm start` (deve aparecer `Server started on port...`), pare com
`CTRL + C` e entregue ao pm2:

```bash
sudo npm install -g pm2
pm2 start dist/server.js --name whaticket-backend
pm2 startup ubuntu -u $USER     # rode o comando que ele imprimir
```

**Frontend**

```bash
cd ../frontend
npm install
echo "VITE_BACKEND_URL = https://api.meudominio.com/" > .env
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
  server_name app.meudominio.com;

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

Copie o arquivo para o backend, trocando `server_name` para `api.meudominio.com` e
`proxy_pass` para `http://127.0.0.1:8080`, e habilite os dois:

```bash
sudo cp /etc/nginx/sites-available/whaticket-frontend /etc/nginx/sites-available/whaticket-backend
sudo nano /etc/nginx/sites-available/whaticket-backend
sudo ln -s /etc/nginx/sites-available/whaticket-frontend /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/whaticket-backend  /etc/nginx/sites-enabled
```

O nginx limita o corpo das requisições a 1MB, pouco demais para upload de mídia. Em
`/etc/nginx/nginx.conf`, dentro do bloco `http { }`:

```nginx
client_max_body_size 20M;
```

```bash
sudo nginx -t && sudo service nginx restart
```

**HTTPS**, obrigatório para notificações e envio de áudio:

```bash
sudo snap install --classic certbot
sudo certbot --nginx
```

</details>

## Configuração

### Backend (`backend/.env`)

| Variável | Descrição | Padrão |
|---|---|---|
| `WHATSAPP_PROVIDER` | Driver do WhatsApp: `wwebjs` ou `whaileys` | `wwebjs` |
| `NODE_ENV` | `DEVELOPMENT` deixa o log mais verboso | |
| `PORT` | Porta em que o backend escuta | `8080` |
| `PROXY_PORT` | Porta pública atrás do reverse proxy (`443` em produção) | `8080` |
| `BACKEND_URL` | URL pública do backend | `http://localhost:8080` |
| `FRONTEND_URL` | URL pública do frontend. **O CORS depende disso** | `http://localhost:3000` |
| `DB_HOST` / `DB_PORT` | Host e porta do banco | `localhost` / `3306` |
| `DB_DIALECT` | `mysql` | `mysql` |
| `DB_NAME` / `DB_USER` / `DB_PASS` | Credenciais do banco | |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Segredos de assinatura dos tokens, **troque** | |
| `REDIS_URL` | String de conexão do Redis. Vazio desativa | |
| `REDIS_DB` | Índice do banco Redis para as chaves de sessão | `0` |
| `CHROME_BIN` / `CHROME_WS` / `CHROME_ARGS` | Configuração do Puppeteer/Chrome (só `wwebjs`) | |
| `LOG_LEVEL` | `silent`, `fatal`, `error`, `warn`, `info`, `debug`, `trace` | `info` |
| `WHAILEYS_LOG_LEVEL` | Nível de log do provider `whaileys` | `error` |

### Frontend (`frontend/.env`)

| Variável | Descrição |
|---|---|
| `VITE_BACKEND_URL` | URL do backend com que o app conversa |
| `VITE_HOURS_CLOSE_TICKETS_AUTO` | Horas de inatividade até o fechamento automático do ticket |

### Escolhendo um provider de WhatsApp

| | `wwebjs` | `whaileys` |
|---|---|---|
| Como conecta | Puppeteer controlando o WhatsApp Web | Protocolo WebSocket direto |
| Consumo de memória | Alto, um Chrome por sessão | Baixo |
| Dependências de sistema | Chrome + vários pacotes `lib*` | Nenhuma |
| Maturidade neste repositório | Padrão, em produção há anos | Mais novo, em desenvolvimento ativo |

Alterne entre eles com `WHATSAPP_PROVIDER` no `backend/.env`.

## Atualizando uma instalação existente

Sempre compare o `.env.example` com o seu `.env` antes de atualizar. Variáveis novas aparecem
lá primeiro.

```bash
#!/bin/bash
echo "Atualizando a Whaticket, aguarde."

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
echo "Atualização concluída. Aproveite!"
```

## Status do projeto

**Em modo de manutenção, com o desenvolvimento ativo voltando.**

Nos últimos anos este repositório recebeu apenas correções de segurança e atualizações de
dependências, enquanto o esforço do time foi para a plataforma comercial. Isso está mudando:
planejamos retomar o trabalho regular de features aqui. Os commits recentes são os primeiros
passos: o frontend migrou para o Vite, e a integração com o WhatsApp passou a usar uma camada
plugável de providers, com o novo driver [whaileys](https://github.com/canove/whaileys).

O que isso significa para você hoje:

- Issues e pull requests são lidos. As revisões podem demorar.
- O código é estável e amplamente usado, mas espere arestas e dependências antigas.
- Mudanças que quebram compatibilidade serão sinalizadas nas notas de versão.

Se você depende deste projeto, [conte para a gente no Discord](https://discord.gg/Dp2tTZRYHg)
o que mais faz falta. É isso que define as prioridades.

## Contribuindo

Pull requests são bem-vindos. Correções de bugs, atualização de dependências, documentação e
traduções são todas bem-vindas. Para qualquer coisa grande, abra uma issue antes para
combinarmos a abordagem.

- 💬 [Discord](https://discord.gg/Dp2tTZRYHg): dúvidas e discussão
- 🗣️ [Fórum da comunidade](https://whaticket.online/)
- 🐛 [Issues](https://github.com/canove/whaticket/issues): bugs e sugestões

## Projetos relacionados

- **[whaileys](https://github.com/canove/whaileys)**: a biblioteca WebSocket de WhatsApp usada
  pelo provider `whaileys`
- **[Whaticket](https://whaticket.com/pt/?utm_source=github&utm_medium=readme&utm_campaign=whaticket-oss&utm_content=pt-related-projects)**: a plataforma comercial gerenciada

## Licença

[MIT](LICENSE) © Whaticket e contribuidores.

## Aviso legal

Este projeto não é afiliado, associado, autorizado, endossado nem oficialmente conectado de
qualquer forma ao WhatsApp ou a qualquer uma de suas subsidiárias ou afiliadas. O site oficial
do WhatsApp é <https://whatsapp.com>. "WhatsApp" e nomes, marcas, emblemas e imagens
relacionados são marcas registradas de seus respectivos donos.

Usar clientes não oficiais para conectar ao WhatsApp pode resultar no bloqueio do seu número.
Use este software por sua conta e risco, e revise-o de acordo com os seus próprios requisitos
de segurança antes de expô-lo à internet.
