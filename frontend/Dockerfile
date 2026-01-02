# Stage 1: Build
FROM node:22-alpine AS build-deps
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Install tools
RUN apk add --no-cache jq openssl bash

# Install dockerize (still useful for runtime env vars if needed)
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

ENV PUBLIC_HTML=/usr/share/nginx/html

# Copy Nginx config
COPY .docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=build-deps /app/dist ${PUBLIC_HTML}

EXPOSE 80

COPY .docker/add-env-vars.sh /docker-entrypoint.d/01-add-env-vars.sh
RUN chmod +x /docker-entrypoint.d/01-add-env-vars.sh

CMD ["nginx", "-g", "daemon off;"]
