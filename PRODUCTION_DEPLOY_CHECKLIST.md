# ✅ Checklist de Deploy - Produção

## WhatTicket Community Edition

---

## 🔍 **PRÉ-DEPLOY - VERIFICAÇÕES OBRIGATÓRIAS**

### Ambiente de Desenvolvimento:

- [ ] **Build local executado com sucesso** (`npm run build`)
- [ ] **Testes automatizados passando** (`npm test`)
- [ ] **ESLint sem erros** (verificado)
- [ ] **Nenhum console.log em produção** (verificado ✅)
- [ ] **Variáveis de ambiente configuradas**
- [ ] **Dependências atualizadas** (`npm audit`)

### Código e Qualidade:

- [ ] **Code review aprovado**
- [ ] **Branch main/master atualizada**
- [ ] **Commits com mensagens descritivas**
- [ ] **Migrações de banco documentadas**
- [ ] **Breaking changes documentados**

---

## 🖥️ **AMBIENTE DE STAGING**

### Infraestrutura:

- [ ] **Servidor staging disponível**
- [ ] **Banco de dados staging configurado**
- [ ] **SSL certificado válido**
- [ ] **DNS configurado corretamente**
- [ ] **Firewall/Proxy configurado**

### Deploy Staging:

- [ ] **Backend deployado em staging**
- [ ] **Frontend deployado em staging**
- [ ] **Migrações executadas**
- [ ] **Seeds aplicados (se necessário)**
- [ ] **Variáveis de ambiente configuradas**

### Testes em Staging:

- [ ] **Login funcional**
- [ ] **Criação de tickets**
- [ ] **Envio de mensagens**
- [ ] **Upload de arquivos**
- [ ] **Notificações funcionando**
- [ ] **WhatsApp integration**
- [ ] **Performance aceitável**
- [ ] **Responsividade mobile**

---

## 🚀 **DEPLOY EM PRODUÇÃO**

### Preparação:

- [ ] **Backup do banco de dados atual**
- [ ] **Backup dos arquivos de aplicação**
- [ ] **Janela de manutenção agendada**
- [ ] **Equipe de suporte notificada**
- [ ] **Plano de rollback definido**

### Verificações de Sistema:

- [ ] **Espaço em disco suficiente**
- [ ] **Memória RAM disponível**
- [ ] **CPU com baixa utilização**
- [ ] **Serviços MySQL/Redis funcionando**
- [ ] **Nginx/Apache funcionando**

### Configurações de Ambiente:

- [ ] **Arquivo .env backend configurado**
- [ ] **Arquivo .env frontend configurado**
- [ ] **REACT_APP_BACKEND_URL correto**
- [ ] **JWT_SECRET seguro**
- [ ] **JWT_REFRESH_SECRET seguro**
- [ ] **MYSQL credenciais corretas**

---

## 📦 **PROCESSO DE DEPLOY**

### Backend:

- [ ] **Parar aplicação atual**

```bash
pm2 stop whaticket-backend
```

- [ ] **Fazer backup da versão atual**

```bash
cp -r /var/www/whaticket /backup/$(date +%Y%m%d_%H%M%S)/
```

- [ ] **Atualizar código**

```bash
git pull origin main
```

- [ ] **Instalar dependências**

```bash
cd backend && npm ci --production
```

- [ ] **Executar migrações**

```bash
npm run sequelize db:migrate
```

- [ ] **Build da aplicação**

```bash
npm run build
```

- [ ] **Iniciar aplicação**

```bash
pm2 start ecosystem.config.js
```

### Frontend:

- [ ] **Executar build de produção**

```bash
cd frontend && npm run build
```

- [ ] **Verificar tamanho do bundle**
- [ ] **Copiar build para servidor web**

```bash
cp -r build/* /var/www/html/
```

- [ ] **Configurar permissões**

```bash
chown -R www-data:www-data /var/www/html/
```

- [ ] **Recarregar servidor web**

```bash
sudo systemctl reload nginx
```

---

## 🧪 **TESTES PÓS-DEPLOY**

### Testes Funcionais Críticos:

- [ ] **Site carregando** (https://myapp.mydomain.com)
- [ ] **API respondendo** (https://api.mydomain.com/health)
- [ ] **Login de usuário**
- [ ] **Dashboard carregando**
- [ ] **Criação de novo ticket**
- [ ] **Envio de mensagem**
- [ ] **Recebimento de mensagem**
- [ ] **Upload de arquivo**
- [ ] **Download de arquivo**
- [ ] **Notificações push**

### Testes de Performance:

- [ ] **Tempo de carregamento < 3s**
- [ ] **First Contentful Paint < 2s**
- [ ] **Time to Interactive < 4s**
- [ ] **Bundle size aceitável** (atualmente ~597kB gzipped)
- [ ] **Lighthouse Score > 80**

### Testes de Integração:

- [ ] **WhatsApp conectando**
- [ ] **QR Code gerando**
- [ ] **Mensagens sincronizando**
- [ ] **Webhook funcionando**
- [ ] **API endpoints respondendo**

---

## 🔍 **VERIFICAÇÕES DE SEGURANÇA**

### SSL e HTTPS:

- [ ] **Certificado SSL válido**
- [ ] **Redirecionamento HTTP -> HTTPS**
- [ ] **HSTS configurado**
- [ ] **Headers de segurança configurados**

### Aplicação:

- [ ] **JWT tokens funcionando**
- [ ] **Autenticação/Autorização**
- [ ] **Rate limiting ativo**
- [ ] **CORS configurado corretamente**
- [ ] **Inputs sanitizados**

---

## 📊 **MONITORAMENTO PÓS-DEPLOY**

### Logs para Verificar:

- [ ] **Logs de erro** (`pm2 logs --err`)
- [ ] **Logs do Nginx** (`tail -f /var/log/nginx/error.log`)
- [ ] **Logs do MySQL** (`tail -f /var/log/mysql/error.log`)
- [ ] **Logs do sistema** (`journalctl -f`)

### Métricas para Monitorar:

- [ ] **CPU usage** (`htop`)
- [ ] **Memory usage** (`free -m`)
- [ ] **Disk usage** (`df -h`)
- [ ] **Network connections** (`netstat -an`)
- [ ] **Database connections**

### Ferramentas de Monitoramento:

- [ ] **PM2 status** (`pm2 status`)
- [ ] **PM2 monitoring** (`pm2 monit`)
- [ ] **Nginx status** (`systemctl status nginx`)
- [ ] **MySQL status** (`systemctl status mysql`)

---

## 🚨 **PLANO DE ROLLBACK**

### Quando Fazer Rollback:

- [ ] **Erros críticos na aplicação**
- [ ] **Performance degradada > 50%**
- [ ] **Funcionalidades críticas quebradas**
- [ ] **Mais de 10% de erro rate**

### Processo de Rollback:

1. [ ] **Parar aplicação atual**

```bash
pm2 stop whaticket-backend
```

2. [ ] **Restaurar backup anterior**

```bash
cp -r /backup/YYYYMMDD_HHMMSS/whaticket /var/www/
```

3. [ ] **Restaurar banco de dados**

```bash
mysql -u root -p whaticket < /backup/YYYYMMDD_HHMMSS/db_backup.sql
```

4. [ ] **Reiniciar serviços**

```bash
pm2 start whaticket-backend
sudo systemctl reload nginx
```

5. [ ] **Verificar funcionamento**
6. [ ] **Notificar equipe**

---

## 📝 **COMUNICAÇÃO**

### Antes do Deploy:

- [ ] **Notificar equipe técnica**
- [ ] **Comunicar usuários (se downtime)**
- [ ] **Agendar janela de manutenção**

### Durante o Deploy:

- [ ] **Status updates no Slack/Teams**
- [ ] **Monitorar métricas em tempo real**
- [ ] **Manter log de atividades**

### Após o Deploy:

- [ ] **Confirmar sucesso para a equipe**
- [ ] **Atualizar documentação se necessário**
- [ ] **Post-mortem (se houve problemas)**

---

## ⏱️ **TIMELINE ESTIMADO**

| Fase              | Tempo Estimado | Responsável |
| ----------------- | -------------- | ----------- |
| Preparação        | 30 min         | DevOps      |
| Backup            | 15 min         | DevOps      |
| Deploy Backend    | 20 min         | Dev/DevOps  |
| Deploy Frontend   | 10 min         | Dev/DevOps  |
| Testes Pós-Deploy | 30 min         | QA/Dev      |
| Verificação Final | 15 min         | DevOps      |
| **TOTAL**         | **~2 horas**   |             |

---

## 📞 **CONTATOS DE EMERGÊNCIA**

| Função    | Nome | Telefone | Email |
| --------- | ---- | -------- | ----- |
| Tech Lead | -    | -        | -     |
| DevOps    | -    | -        | -     |
| DBA       | -    | -        | -     |
| Suporte   | -    | -        | -     |

---

**✅ DEPLOY CONCLUÍDO COM SUCESSO!**

\_Data: **\_\_\_**  
\_Responsável: **\_\_\_**  
\_Versão Deployada: **\_\_\_**  
\_Observações: **\_\_\_**

---

**📋 IMPORTANTE**:

- Imprima ou mantenha este checklist acessível durante o deploy
- Marque cada item apenas após confirmação
- Em caso de problemas, consulte o plano de rollback imediatamente
- Documente qualquer desvio do processo padrão
