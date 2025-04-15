# Etapa de build
FROM node:18 as build

WORKDIR /app

# Copia os arquivos da pasta backend
COPY backend ./backend

WORKDIR /app/backend

# Instala TypeScript atualizado e dependências
RUN npm install typescript@^5.2.0 --save-dev && npm install

# Compila o backend
RUN npm run build

# Etapa de produção
FROM node:18-alpine as production

WORKDIR /app

# Copia apenas os arquivos essenciais
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/package.json ./

RUN npm install --only=production

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
