FROM node:22-alpine AS build-deps
WORKDIR /usr/src/app

ARG VITE_APP_VERSION
ARG VITE_GIT_SHA
ARG VITE_BUILD_DATE
ENV VITE_APP_VERSION=$VITE_APP_VERSION \
    VITE_GIT_SHA=$VITE_GIT_SHA \
    VITE_BUILD_DATE=$VITE_BUILD_DATE

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY .env* ./
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.js ./
RUN npm run build

FROM nginx:alpine
RUN apk add --no-cache jq openssl

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENV PUBLIC_HTML=/var/www/public/

COPY .docker/nginx /etc/nginx/
COPY --from=build-deps /usr/src/app/build ${PUBLIC_HTML}
EXPOSE 80

COPY .docker/add-env-vars.sh /docker-entrypoint.d/01-add-env-vars.sh
RUN chmod +x /docker-entrypoint.d/01-add-env-vars.sh