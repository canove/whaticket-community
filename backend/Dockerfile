FROM node:14-alpine as build-deps

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:14-alpine

RUN apk add --no-cache openssl

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

WORKDIR /usr/src/app
COPY --from=build-deps /usr/src/app/node_modules/ ./node_modules/
COPY --from=build-deps /usr/src/app/dist/ ./dist/
COPY .sequelizerc .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

ENTRYPOINT dockerize -wait tcp://${DB_HOST}:3306 \
  && npx sequelize db:migrate \
  && node dist/server.js