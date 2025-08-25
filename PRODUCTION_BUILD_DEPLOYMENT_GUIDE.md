# Guia de Deploy - Build de Produção Otimizado

## WhatTicket Community Edition

### 📊 **MÉTRICAS DO BUILD ATUAL**

**Build executado com sucesso em:** 25/08/2025 00:53:14 UTC

#### Tamanhos dos Arquivos (Após Gzip):

- **main.c2446459.js**: 596.93 kB (-450 B otimização)
- **885.bd9b1ed5.chunk.js**: 9.78 kB (code splitting ativo)
- **main.752f6f9f.css**: 3.2 kB

#### Tamanhos dos Arquivos (Descomprimidos):

- **main.c2446459.js**: 2.38 MB
- **885.bd9b1ed5.chunk.js**: 36.7 KB
- **main.752f6f9f.css**: 15.4 KB
- **Total do build**: ~11.17 MB

---

## 🚀 **PRÉ-REQUISITOS PARA DEPLOY**

### Backend Requirements:

- Node.js 18+ ou superior
- MySQL 5.7+ ou 8.0+
- Redis (opcional, para cache)
- Nginx (recomendado para proxy reverso)

### Frontend Requirements:

- Servidor web estático (Nginx, Apache, ou CDN)
- Certificado SSL válido
- Suporte a Single Page Application (SPA)

---

## 📋 **VARIÁVEIS DE AMBIENTE OBRIGATÓRIAS**

### Backend (.env):

```env
# MYSQL
MYSQL_ENGINE=mysql
MYSQL_VERSION=8.0
MYSQL_ROOT_PASSWORD=<senha_segura>
MYSQL_DATABASE=whaticket
MYSQL_PORT=3306
TZ=America/Sao_Paulo

# BACKEND
BACKEND_PORT=8080
BACKEND_SERVER_NAME=api.mydomain.com
BACKEND_URL=https://api.mydomain.com
PROXY_PORT=443
JWT_SECRET=<jwt_secret_seguro>
JWT_REFRESH_SECRET=<jwt_refresh_secret_seguro>

# FRONTEND
FRONTEND_PORT=80
FRONTEND_SSL_PORT=443
FRONTEND_SERVER_NAME=myapp.mydomain.com
FRONTEND_URL=https://myapp.mydomain.com

# BROWSERLESS
MAX_CONCURRENT_SESSIONS=10

# PHPMYADMIN (opcional)
PMA_PORT=8081
```

### Frontend (.env):

```env
REACT_APP_BACKEND_URL=https://api.mydomain.com/
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
```

---

## 🛠️ **PROCESSO DE BUILD E DEPLOY**

### 1. **Preparação do Ambiente**

```bash
# Clone o repositório
git clone <repository-url>
cd whaticket-community

# Instalar dependências do backend
cd backend
npm ci --production

# Instalar dependências do frontend
cd ../frontend
npm ci
```

### 2. **Build de Produção**

```bash
# No diretório frontend
cd frontend
npm run build

# Verificar se build foi criado com sucesso
ls -la build/
```

### 3. **Configuração do Backend**

```bash
# No diretório backend
cd backend

# Configurar arquivo .env com variáveis de produção
cp .env.example .env
nano .env

# Executar migrações do banco
npm run sequelize db:migrate
npm run sequelize db:seed:all

# Iniciar em modo produção
npm start
```

### 4. **Configuração do Frontend**

#### Opção A: Nginx (Recomendado)

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name myapp.mydomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name myapp.mydomain.com;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Build files location
    root /var/www/whaticket/frontend/build;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Opção B: Apache

```apache
<VirtualHost *:80>
    ServerName myapp.mydomain.com
    Redirect permanent / https://myapp.mydomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName myapp.mydomain.com
    DocumentRoot /var/www/whaticket/frontend/build

    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key

    # Enable compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>

    # Static files caching
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
    </LocationMatch>

    # SPA fallback
    RewriteEngine On
    RewriteRule ^(?!.*\.).*$ /index.html [L]

    # API proxy
    ProxyPass /api http://localhost:8080/api
    ProxyPassReverse /api http://localhost:8080/api
</VirtualHost>
```

---

## ✅ **OTIMIZAÇÕES IMPLEMENTADAS**

### Build Otimizations:

- ✅ **Code Splitting**: Chunk separado (885.bd9b1ed5.chunk.js)
- ✅ **Minificação**: Arquivos JS e CSS minificados
- ✅ **Gzip Ready**: Build otimizado para compressão
- ✅ **Source Maps**: Disponíveis para debug em produção
- ✅ **Asset Optimization**: Imagens e media otimizados
- ✅ **Tree Shaking**: Código não utilizado removido

### Code Quality Checks:

- ✅ **No Console Logs**: Verificado - nenhum console.log encontrado
- ✅ **Production Ready**: Build configurado para produção
- ✅ **Environment Variables**: Configuração separada por ambiente

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### 1. **PM2 para Backend (Recomendado)**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Criar arquivo ecosystem.config.js
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'whaticket-backend',
    script: './dist/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Iniciar aplicação
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. **Docker Compose (Alternativa)**

```yaml
version: "3.8"

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
      MYSQL_DATABASE: ${MYSQL_DATABASE}
    volumes:
      - mysql_data:/var/lib/mysql
    restart: always

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
    volumes:
      - ./backend:/app
    depends_on:
      - mysql
    restart: always

  frontend:
    image: nginx:alpine
    volumes:
      - ./frontend/build:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    restart: always

volumes:
  mysql_data:
```

---

## 🚨 **TROUBLESHOOTING**

### Problemas Comuns:

1. **Bundle muito grande (596.93 kB)**

   ```bash
   # Implementar lazy loading em rotas grandes
   # Considerar code splitting adicional
   # Verificar dependências desnecessárias
   ```

2. **Erro de CORS**

   ```bash
   # Verificar REACT_APP_BACKEND_URL no .env
   # Configurar CORS no backend adequadamente
   ```

3. **Problemas de SSL**

   ```bash
   # Verificar certificado SSL válido
   # Confirmar redirecionamento HTTP -> HTTPS
   ```

4. **Performance lenta**
   ```bash
   # Implementar cache no Nginx
   # Usar CDN para assets estáticos
   # Otimizar imagens
   ```

---

## 📝 **LOGS E MONITORAMENTO**

### Localizações de Logs:

- **Backend**: `/app/logs/` (se usando PM2)
- **Frontend**: Logs do servidor web (Nginx/Apache)
- **Sistema**: `/var/log/`

### Comandos de Monitoramento:

```bash
# Verificar status do PM2
pm2 status
pm2 logs

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Verificar uso de recursos
htop
df -h
free -m
```

---

## 🔄 **PROCEDIMENTOS DE ROLLBACK**

### Rollback Rápido:

```bash
# 1. Parar aplicação atual
pm2 stop whaticket-backend

# 2. Restaurar backup anterior
cp -r /backup/frontend/build /var/www/whaticket/frontend/
cp -r /backup/backend /var/www/whaticket/

# 3. Reiniciar serviços
pm2 start whaticket-backend
sudo systemctl reload nginx
```

### Backup Antes do Deploy:

```bash
# Criar backup
mkdir -p /backup/$(date +%Y%m%d_%H%M%S)
cp -r /var/www/whaticket /backup/$(date +%Y%m%d_%H%M%S)/
```

---

**📞 SUPORTE**: Em caso de problemas, consulte os logs primeiro e verifique as configurações de ambiente.

**⚠️ IMPORTANTE**: Sempre teste o deploy em ambiente de staging antes de produção!
