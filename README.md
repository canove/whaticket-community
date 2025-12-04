# Teste Técnico - Whaticket Community

Este repositório contém a implementação da **Etapa 2** do teste técnico, focada na implementação e melhoria da funcionalidade de busca de mensagens.

## Sobre o Projeto

O Whaticket é um sistema de gestão de tickets baseado em mensagens do WhatsApp. Esta versão foi modificada para atender aos requisitos de performance e usabilidade solicitados no desafio.

## 💻 Tecnologias Utilizadas

*   **Node.js**: v20 (Bullseye)
*   **React**: v16.13
*   **Material UI**: v4.11
*   **TypeScript**: v4.7
*   **Sequelize**: v5.22
*   **Banco de Dados**: MariaDB 10.6
*   **Build Tool**: Vite v4.5

## Funcionalidades Implementadas

A principal atualização nesta versão é a **Nova Busca de Mensagens**, projetada para alta performance em grandes volumes de dados.

### Detalhes da Implementação:

1.  **Busca Otimizada (Full Text Search)**:
    *   Implementação de índice `FULLTEXT` no banco de dados MySQL/MariaDB.
    *   Utilização de queries `MATCH ... AGAINST` em modo booleano.
    *   **Resultado**: Buscas em menos de **2 segundos** mesmo em tickets com **1 milhão de mensagens**.

2.  **Insensibilidade a Acentos e Maiúsculas**:
    *   Ajuste de *collation* do banco de dados para `utf8mb4_general_ci`.
    *   Buscas por "avião" encontram "aviao", "AVIÃO", etc.

3.  **Interface de Usuário**:
    *   Novo botão de busca no cabeçalho do ticket.
    *   Modal lateral (*Drawer*) para exibição dos resultados.
    *   Navegação direta para a mensagem selecionada no chat.

## Instalação e Execução

### Pré-requisitos

*   Docker e Docker Compose
*   Node.js (para execução local de scripts, opcional)

### Passo a Passo

1.  **Clone o repositório**:
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd whaticket-community
    ```

2.  **Configure as variáveis de ambiente**:
    Copie o arquivo de exemplo e ajuste se necessário (as configurações padrão funcionam para o Docker):
    ```bash
    cp .env.example .env
    cp backend/.env.example backend/.env
    cp frontend/.env.example frontend/.env
    ```

3.  **Inicie a aplicação com Docker Compose**:
    ```bash
    docker compose up -d --build
    ```

4.  **Execute as migrações e seeds do banco de dados**:
    ```bash
    docker compose exec backend npx sequelize db:migrate
    docker compose exec backend npx sequelize db:seed:all
    ```

5.  **Acesse a aplicação**:
    *   Frontend: `http://localhost:3000`
    *   Backend: `http://localhost:8080`
    *   **Login Admin**:
        *   Email: `admin@whaticket.com`
        *   Senha: `admin`

## Teste de Performance (1 Milhão de Mensagens)

Para validar o requisito de performance, foi criado um script automatizado que popula o banco de dados com 1 milhão de mensagens em um ticket de teste.

### Como executar o teste:

1.  Certifique-se de que a aplicação está rodando.
2.  Execute o comando de seed de performance:
    ```bash
    docker compose exec backend npm run db:seed:performance
    ```
    *Este processo pode levar alguns minutos dependendo do hardware.*

3.  Após a conclusão, acesse o **Ticket #1** (associado ao usuário Admin) e utilize a lupa para buscar por termos.

4.  O tempo de resposta deve ser instantâneo (< 2 segundos).

---
**Desenvolvido por Caio Vitor Andrade Freitas**
