FROM node:22-slim

RUN apt-get update && apt-get install -y \
    dumb-init \
    netcat-openbsd \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*
    
WORKDIR /usr/src/app

ARG GIT_SHA
ARG BUILD_DATE
ENV GIT_SHA=$GIT_SHA \
    BUILD_DATE=$BUILD_DATE

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--"]
CMD sh -c '\
  until nc -z "$DB_HOST" "${DB_PORT:-5432}"; do echo "Waiting for postgres..."; sleep 2; done; \
  npx sequelize db:migrate && \
  npx sequelize db:seed:all || true && \
  node dist/server.js'
