# Etapa 1 - Build
FROM node:20-slim AS build

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos essenciais para instalar dependências
COPY backend/package.json backend/package-lock.json* backend/tsconfig.json ./backend/

# Entra na pasta backend
WORKDIR /app/backend

# Instala TypeScript e dependências
RUN npm install typescript@^5.2.0 --save-dev && npm install

# Copia o restante do código
COPY backend/ .

# Compila a aplicação
RUN npm run build

# Etapa 2 - Produção
FROM node:20-slim AS production

WORKDIR /app

# Copia apenas os arquivos necessários do build
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/package.json ./

# Instala apenas as dependências de produção
RUN npm install --omit=dev

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]