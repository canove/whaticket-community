# Whaticket Enterprise Backend v2

Backend modernizado do Whaticket usando NestJS, Prisma, PostgreSQL, Redis e Baileys.

## 🚀 Stack

- **Node.js** 22 LTS
- **NestJS** 11.x - Framework enterprise
- **Prisma** 7.x - ORM type-safe
- **PostgreSQL** 16 - Banco de dados
- **Redis** 7 - Cache e filas
- **Baileys** 6.7.x - WhatsApp Web API
- **BullMQ** - Job queues
- **Socket.io** - WebSocket

## 📁 Estrutura

```
backend-v2/
├── prisma/
│   └── schema.prisma        # Schema do banco de dados
├── src/
│   ├── config/              # Configurações modulares
│   ├── database/            # Prisma service
│   ├── gateways/            # WebSocket gateway
│   ├── modules/
│   │   ├── auth/            # Autenticação JWT
│   │   ├── users/           # Gestão de usuários
│   │   ├── whatsapp/        # Integração com Baileys
│   │   ├── tickets/         # Gestão de tickets
│   │   ├── contacts/        # Gestão de contatos
│   │   ├── queues/          # Filas de atendimento
│   │   ├── messages/        # Mensagens
│   │   └── health/          # Health check
│   ├── app.module.ts
│   └── main.ts
├── test/                    # Testes E2E
├── Dockerfile               # Build multi-stage
├── .env.example             # Variáveis de ambiente
└── package.json
```

## 🛠️ Instalação

### Pré-requisitos

- Node.js 22+ (recomendado usar fnm ou nvm)
- Docker e Docker Compose
- PostgreSQL 16 e Redis 7 (ou usar Docker)

### Desenvolvimento Local

```bash
# Instalar Node.js 22 via fnm
curl -fsSL https://fnm.vercel.app/install | bash
fnm install 22
fnm use 22

# Navegar para o diretório
cd backend-v2

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Iniciar infraestrutura via Docker
docker compose -f ../docker-compose.v2.yaml up -d postgres redis

# Executar migrations
npx prisma migrate dev

# Iniciar em modo desenvolvimento
npm run start:dev
```

### API Base URL

```
http://localhost:3001/api/v1
```

### Swagger Documentation

```
http://localhost:3001/docs
```

## 📡 API Endpoints

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | /auth/login | Login | Público |
| POST | /auth/register | Registro | Público |
| POST | /auth/refresh | Renovar token | Público |
| POST | /auth/logout | Logout | JWT |
| POST | /auth/logout-all | Logout global | JWT |

### Usuários

| Método | Endpoint | Descrição | Roles |
|--------|----------|-----------|-------|
| GET | /users | Listar | admin, supervisor |
| GET | /users/:id | Buscar | - |
| POST | /users | Criar | admin |
| PUT | /users/:id | Atualizar | admin |
| DELETE | /users/:id | Excluir | admin |

### Tickets

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /tickets | Listar |
| GET | /tickets/:id | Detalhes |
| POST | /tickets | Criar |
| PUT | /tickets/:id | Atualizar |
| POST | /tickets/:id/transfer | Transferir |
| POST | /tickets/:id/close | Fechar |
| POST | /tickets/:id/reopen | Reabrir |

### Contatos, Filas e Mensagens

CRUD completo disponível em `/contacts`, `/queues`, `/messages`.

## 🔌 WebSocket

### Conexão

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});

socket.on('connected', (data) => {
  console.log('Connected as user:', data.userId);
});
```

### Eventos

| Evento | Descrição |
|--------|-----------|
| `ticket:created` | Novo ticket criado |
| `ticket:updated` | Ticket atualizado |
| `ticket:closed` | Ticket fechado |
| `message:created` | Nova mensagem |
| `whatsapp:qrcode` | QR Code gerado |
| `whatsapp:connection` | Status de conexão |

### Rooms

```javascript
// Entrar em sala de ticket
socket.emit('join:ticket', ticketId);

// Entrar em sala de fila
socket.emit('join:queue', queueId);
```

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e

# Cobertura
npm run test:cov
```

## 🐳 Docker

### Build

```bash
docker build -t whaticket-backend:v2 .
```

### Docker Compose

```bash
# Desenvolvimento (com ferramentas de debug)
docker compose -f docker-compose.v2.yaml --profile dev up -d

# Produção
docker compose -f docker-compose.v2.yaml up -d
```

## 📊 Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `NODE_ENV` | Ambiente | development |
| `PORT` | Porta do servidor | 3001 |
| `DATABASE_URL` | URL do PostgreSQL | - |
| `REDIS_HOST` | Host do Redis | localhost |
| `REDIS_PORT` | Porta do Redis | 6379 |
| `JWT_SECRET` | Segredo JWT | - |
| `JWT_REFRESH_SECRET` | Segredo refresh | - |
| `FRONTEND_URL` | URL do frontend | http://localhost:3000 |

## 📝 Scripts

| Script | Descrição |
|--------|-----------|
| `npm run start:dev` | Desenvolvimento com hot reload |
| `npm run build` | Build de produção |
| `npm run start:prod` | Iniciar produção |
| `npm run lint` | Executar ESLint |
| `npm run test` | Rodar testes |

## 🔒 Segurança

- JWT com refresh tokens
- Token version para invalidação global
- Rate limiting via Throttler
- Helmet para headers HTTP
- CORS configurável
- Bcrypt para hash de senhas
- Guards RBAC

## 📄 Licença

MIT
