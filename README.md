# Whaticket

Sistema de atendimento multichannel via WhatsApp.

## Stack

**Backend:** NestJS • Prisma • PostgreSQL • Redis • Socket.io • Baileys  
**Frontend:** React 19 • Vite • MUI 6 • Zustand

## Quick Start

### Docker (Recomendado)

```bash
# Clone e configure
git clone https://github.com/gabrielima7/whaticket-community.git
cd whaticket-community
cp .env.example .env

# Inicie os containers
docker compose up -d --build
```

### Instalação Manual

```bash
# Clone e configure
git clone https://github.com/gabrielima7/whaticket-community.git
cd whaticket-community
cp .env.example .env

# Backend
cd backend
npm install
cp .env.example .env          # Configure as variáveis
npx prisma generate           # Gera o cliente Prisma
npx prisma db push            # Cria as tabelas no banco
npm run start:dev

# Frontend (em outro terminal)
cd frontend
npm install --legacy-peer-deps # Flag necessária para React 19
cp .env.example .env
npm run dev
```

> **Nota:** O flag `--legacy-peer-deps` é necessário no frontend devido a incompatibilidades de peer dependencies com React 19.

## URLs Padrão

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| Swagger Docs | http://localhost:3001/docs |
| Adminer (dev) | http://localhost:8080 |

Para ativar ferramentas de desenvolvimento (Adminer, Redis Commander):
```bash
docker compose --profile dev up -d
```

## Features

| Core | Premium |
|------|---------|
| ✅ Multi-atendimento | ✅ Etiquetas coloridas |
| ✅ Filas/Setores | ✅ Kanban drag & drop |
| ✅ Tickets | ✅ Agendamentos |
| ✅ CRM de Contatos | ✅ Chat Interno |
| ✅ QR Code real-time | ✅ Campanhas |
| ✅ Webhooks | ✅ IA (Prompts) |

## Estrutura

```
├── backend/         # NestJS API
│   ├── prisma/      # Schema + migrations
│   └── src/modules/ # auth, tickets, tags, campaigns...
└── frontend/        # React SPA
    └── src/pages/   # Tickets, Kanban, Campaigns...
```

## Troubleshooting

### Frontend: Erro de peer dependencies
```bash
npm install --legacy-peer-deps
```

### Backend: Tipos Prisma não encontrados
```bash
npx prisma generate
```

### Backend: Tabelas não existem no banco
```bash
npx prisma db push
```

## License

MIT
