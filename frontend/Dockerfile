# Build stage
FROM node:22-alpine AS build-deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
RUN apk add --no-cache jq openssl

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENV PUBLIC_HTML=/var/www/public/

# Copy nginx config if it exists
COPY .docker/nginx /etc/nginx/

# Copy Vite build output (dist folder)
COPY --from=build-deps /usr/src/app/build ${PUBLIC_HTML}

EXPOSE 80

# Copy entrypoint script
COPY .docker/add-env-vars.sh /docker-entrypoint.d/01-add-env-vars.sh
RUN chmod +x /docker-entrypoint.d/01-add-env-vars.sh