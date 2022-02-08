FROM node:14-alpine as build-deps
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm install
COPY .env* ./
COPY src/ ./src/
COPY public/ ./public/
RUN echo "REACT_APP_BACKEND_URL=/api/" > .env.production
RUN npm run build

FROM nginx:alpine

RUN apk add --no-cache openssl
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

COPY .docker/nginx /etc/nginx/
COPY --from=build-deps /usr/src/app/build /var/www/public/
EXPOSE 80

RUN echo "dockerize -template /etc/nginx/include.d/spa.conf:/etc/nginx/include.d/spa.conf" > /docker-entrypoint.d/01-change-url-backend.sh \
 && chmod +x /docker-entrypoint.d/01-change-url-backend.sh