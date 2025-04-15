# Etapa 1 - Build (imagem completa para compilar)
FROM node:20-bullseye as build

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos essenciais para instalar dependências
COPY backend/package.json backend/package-lock.json* backend/tsconfig.json ./backend/

# Entra na pasta backend
WORKDIR /app/backend

# Instala TypeScript atualizado e dependências
RUN npm install typescript@^5.2.0 --save-dev && npm install

# Copia o restante do código
COPY backend/ .

# Compila o projeto (gera /dist)
RUN npm run build

# Etapa 2 - Produção (imagem leve e otimizada)
FROM node:20-alpine as production

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos necessários da etapa anterior
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/package.json ./

# Instala apenas as dependências de produção
RUN npm install --omit=dev

# Define variáveis de ambiente padrão
ENV NODE_ENV=production

# Comando para iniciar o backend
CMD ["node", "dist/server.js"]