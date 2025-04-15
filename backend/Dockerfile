# Etapa 1 - Build
FROM node:18 AS builder

WORKDIR /usr/src/app

# Copia só os arquivos necessários inicialmente
COPY backend/package.json backend/package-lock.json* backend/tsconfig.json ./backend/

WORKDIR /usr/src/app/backend

# Instala dependências com TypeScript atualizado
RUN npm install typescript@^5.2.0 --save-dev && npm install

# Copia o restante do código
COPY backend .

# Compila o projeto
RUN npm run build

# Etapa 2 - Produção
FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/backend/dist ./dist
COPY --from=builder /usr/src/app/backend/package.json ./

RUN npm install --only=production

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
