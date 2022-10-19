const messages = {
  pt: {
    translations: {
      login: {
        title: "Login",
        form: {
          company: "Empresa",
          email: "Email",
          password: "Senha",
        },
        buttons: {
          submit: "Entrar",
        },
      },

      auth: {
        toasts: {
          success: "Login efetuado com sucesso!",
        },
      },

      dashboard: {
        title: "Dashboard",
        file: " Arquivo",
        date: "Data",
        charts: {
          perDay: {
            title: "Chamadas hoje: ",
            calls: "Chamadas",
          },
        },
        messages: {
          inAttendance: {
            title: "Em Atendimento",
          },
          waiting: {
            title: "Aguardando",
          },
          closed: {
            title: "Finalizados",
          },
          imported: {
            title: "Importados",
          },
          sent: {
            title: "Enviados",
          },
          handedOut: {
            title: "Entregues",
          },
          read: {
            title: "Lidos",
          },
          mistake: {
            title: "Erros",
          },
          category: {
            title: "Atendimento por Categoria",
          },
        },
      },

      connections: {
        title: "Conexões",
        toasts: {
          deleted: "Conexão com o WhatsApp excluída com sucesso!",
        },
        confirmationModal: {
          deleteTitle: "Deletar",
          deleteMessage: "Você tem certeza? Essa ação não pode ser revertida.",
          disconnectTitle: "Desconectar",
          disconnectMessage:
            "Tem certeza? Você precisará ler o QR Code novamente.",
        },
        buttons: {
          add: "Adicionar WhatsApp",
          disconnect: "desconectar",
          tryAgain: "Tentar novamente",
          qrcode: "QR CODE",
          newQr: "Novo QR CODE",
          connecting: "Conectando",
          previousPage: "Página Anterior",
          nextPage: "Próxima Página"
        },
        toolTips: {
          disconnected: {
            title: "Falha ao iniciar sessão do WhatsApp",
            content:
              "Certifique-se de que seu celular esteja conectado à internet e tente novamente, ou solicite um novo QR Code",
          },
          qrcode: {
            title: "Esperando leitura do QR Code",
            content:
              "Clique no botão 'QR CODE' e leia o QR Code com o seu celular para iniciar a sessão",
          },
          connected: {
            title: "Conexão estabelecida!",
          },
          timeout: {
            title: "A conexão com o celular foi perdida",
            content:
              "Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto, ou clique no botão 'Desconectar' para obter um novo QR Code",
          },
        },
        table: {
          name: "Nome",
          status: "Status",
          lastUpdate: "Última atualização",
          default: "Padrão",
          actions: "Ações",
          session: "Sessão",
          quality: "Qualidade",
          limit: "Limite",
        },
      },

      officialConnections: {
        title: "Conexões Oficiais",
        previousPage: "Página Anterior",
        nextPage: "Próxima Página",
      },

      officialWhatsappModal: {
        title: {
          add: "Adicionar WhatsApp Oficial",
          edit: "Editar WhatsApp Oficial",
          labelNumber: "Número de Telefone",
          labelToken: "Token de Autenticação do Facebook",
          labelId: "Id do Telefone do Facebook",
          labelBusiness: "Facebook Business Id",
          greetingMessage: "Mensagem de saudação",
          farewellMessage: "Mensagem de despedida",
        },
        buttons: {
          cancel: "Cancelar",
          testConnection: "Testar Conexão",
          add: "Adicionar",
        },
      },

      whatsappModal: {
        title: {
          add: "Adicionar WhatsApp",
          edit: "Editar WhatsApp",
        },
        form: {
          name: "Nome",
          default: "Padrão",
          farewellMessage: "Mensagem de despedida",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "WhatsApp salvo com sucesso.",
        required: "Campo Obrigatório!",
        short: "Muito Curto!",
        long: "Muito Longo!",
      },

      qrCode: {
        message: "Leia o QrCode para iniciar a sessão",
      },

      contacts: {
        title: "Contatos",
        toasts: {
          deleted: "Contato excluído com sucesso!",
          required: "Campo Obrigatório!",
          short: "Curto Demais!",
          long: "Número de caracteres excedido!",
          email: "Email Inválido!"
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle: "Deletar ",
          importTitlte: "Importar contatos",
          deleteMessage:
            "Tem certeza que deseja deletar este contato? Todas as chamadas relacionados serão perdidos.",
          importMessage: "Deseja importar todos os contatos do telefone?",
        },
        buttons: {
          import: "Importar Contatos",
          add: "Adicionar Contato",
        },
        table: {
          name: "Nome",
          whatsapp: "WhatsApp",
          email: "Email",
          actions: "Ações",
        },
      },

      contactModal: {
        title: {
          add: "Adicionar contato",
          edit: "Editar contato",
        },
        form: {
          mainInfo: "Dados do contato",
          extraInfo: "Informações adicionais",
          name: "Nome",
          number: "Número do Whatsapp",
          email: "Email",
          extraName: "Nome do campo",
          extraValue: "Valor",
        },
        buttons: {
          addExtraInfo: "Adicionar informação",
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Contato salvo com sucesso.",
      },

      userModal: {
        title: {
          add: "Adicionar usuário",
          edit: "Editar usuário",
        },
        form: {
          name: "Nome",
          email: "Email",
          password: "Senha",
          profile: "Perfil",
          language: "Linguagem",
          user: "Usuário",
          admin: "Admin",
          company: "Empresa",
          languages: {
            pt: "Português",
            en: "Inglês",
            es: "Espanhol",
          },
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Usuário salvo com sucesso.",
        required: "Campo Obrigatório!",
        short: "Muito Curto!",
        long: "Muito Longo!",
        email: "Email Inválido!",
      },

      chat: {
        noTicketMessage: "Selecione uma chamada para começar a conversar.",
      },

      ticketsManager: {
        buttons: {
          newTicket: "Novo",
        },
      },

      ticketsQueueSelect: {
        placeholder: "Filas",
      },

      tickets: {
        toasts: {
          deleted: "A chamada que você estava foi deletado.",
          confirmDelete: "Chamada excluida com sucesso!"
        },
        notification: {
          message: "Mensagem de",
        },
        tabs: {
          open: { title: "Inbox" },
          closed: { title: "Resolvidos" },
          search: { title: "Busca" },
        },
        search: {
          placeholder: "Buscar chamadas e mensagens",
        },
        buttons: {
          showAll: "Todos",
        },
      },

      transferTicketModal: {
        title: "Transferir Chamada",
        fieldLabel: "Digite para buscar usuários",
        fieldQueueLabel: "Transferir para fila",
        fieldQueuePlaceholder: "Selecione uma fila",
        noOptions: "Nenhum usuário encontrado com esse nome",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },

      ticketsList: {
        pendingHeader: "Aguardando",
        assignedHeader: "Atendendo",
        noTicketsTitle: "Nada aqui!",
        noTicketsMessage:
          "Nenhuma chamada encontrada com esse status ou termo pesquisado",
        buttons: {
          accept: "Aceitar",
        },
      },

      newTicketModal: {
        title: "Criar Chamada",
        fieldLabel: "Digite para pesquisar o contato",
        add: "Adicionar",
        buttons: {
          ok: "Salvar",
          cancel: "Cancelar",
        },
      },

      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          template: "Templates",
          tickets: "Chamadas",
          contacts: "Contatos",
          quickAnswers: "Respostas Rápidas",
          importation: "Importação",
          queues: "Filas",
          administration: "Administração",
          users: "Usuários",
          settings: "Configurações",
          reportsTalk: "Relatórios Conversa",
          reportsTicket: "Relatórios Chamadas",
          logReports: "Relatório Registro",
          reports: "Relatórios",
          whatsOff: "WhatsApp",
          whatsNoOff: "WhatsApp 2",
          company: "Empresas",
          menus: "Menus",
          fileImport: "Importação Arquivo",
          integratedImport:"Importação Integrada",
          category: "Categoria",
          adminBits: "Admin BITS",
          menuLink: "Vínculo de Menu",
          registration: "Cadastro",
          finance: "Finanças",
          products: "Produtos",
          pricing: "Precificação",
          payments: "Pagamentos",
          flows: "Fluxo",

        },
        whatsApp: {
          connections: "Conexões",
          officialConnections: "Conexões",
          settings: "Configurações",
        },
        appBar: {
          user: {
            profile: "Perfil",
            logout: "Sair",
          },
        },
      },

      notifications: {
        noTickets: "Nenhuma notificação.",
      },

      queues: {
        title: "Filas",
        table: {
          name: "Nome",
          color: "Cor",
          greeting: "Mensagem de saudação",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar fila",
        },
        confirmationModal: {
          deleteTitle: "Excluir ",
          deleteMessage:
            "Você tem certeza? Essa ação não pode ser revertida! As chamadas dessa fila continuarão existindo, mas não terão mais nenhuma fila atribuída.",
          delete: "Fila excluida com Sucesso!"
        },
      },

      queueModal: {
        title: {
          add: "Adicionar fila",
          edit: "Editar fila",
        },
        form: {
          name: "Nome",
          color: "Cor",
          greetingMessage: "Mensagem de saudação",
          success: "Fila adicionada com Sucesso!",
          edited: "Fila atualizada com Sucesso!",
          required: "Campo Obrigatório!",
          short: "Muito Curto!",
          long: "Muito Longo!",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
      },

      queueSelect: {
        inputLabel: "Filas",
      },

      quickAnswers: {
        title: "Respostas Rápidas",
        table: {
          shortcut: "Atalho",
          message: "Resposta Rápida",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar Resposta Rápida",
        },
        toasts: {
          deleted: "Resposta Rápida excluída com sucesso.",
        },
        searchPlaceholder: "Pesquisar...",
        confirmationModal: {
          deleteTitle:
            "Você tem certeza que quer excluir esta Resposta Rápida: ",
          deleteMessage: "Esta ação não pode ser revertida.",
        },
        yup: {
          required: "Campo Obrigatório!",
          short: "Muito Curto!",
          long: "Muito Longo!",
        },
      },

      quickAnswersModal: {
        title: {
          add: "Adicionar Resposta Rápida",
          edit: "Editar Resposta Rápida",
        },
        form: {
          shortcut: "Atalho",
          message: "Resposta Rápida",
        },
        buttons: {
          okAdd: "Adicionar",
          okEdit: "Salvar",
          cancel: "Cancelar",
        },
        success: "Resposta Rápida salva com sucesso.",
        edited: "Resposta rápida atualizada com sucesso!"
      },

      importation: {
        title: "Importação Arquivo",
        form: {
          status: "Status",
          date: "Data",
          awaitingImport: "Aguardando Importação",
          processing: "Processando",
          waitingForApproval: "Aguardando Aprovação",
          error: "Erro",
          aproved: "Aprovado",
          shooting: "Disparando",
          finished: "Finalizado",
          refused: "Recusado",
        },
        buttons: {
          import: "Importar Disparos",
          filter: "Filtrar",
          previousPage: "Página Anterior",
          nextPage: "Próxima Página",
        },
        table: {
          uploadDate: "Data de Upload",
          fileName: "Nome do Arquivo",
          sentBy: "Enviado por",
          numberOfRecords: "Quantidade de Registros",
          status: "Status",
          official: "Oficial",
          actions: "Ações",
        },
        registryModal: {
          title: "Registros",
          id: "Id",
          name: "Nome",
          template: "Template",
          message: "Mensagem",
          phoneNumber: "Número de Telefone",
          documentNumber: "Número de Documento",
          cancel: "Cancelar",
          refuse: "Recusar",
          approve: "Aprovar",
          previousPage: "Página Anterior",
          nextPage: "Próxima Página"
        },
      },

      importModal: {
        title: "Importar",
        buttons: {
          uploadFile: "Importar Arquivo",
          cancel: "Cancelar",
          import: "Importar",
        },
        form: {
          shotType: "Tipo de Disparo",
          official: "Oficial",
          notOfficial: "Não Oficial",
          noFile: "Nenhum Arquivo Importado",
          uploadedFile: "Arquivo Importado",
          supportedTriggerModel: "Modelo de Disparo Suportado",
          connection: "Conexões: ",
          selectAConnection: "Selecione uma Conexão",
          show: "Mostrar",
          toHide: "Esconder",
          all: "Todos",
          template: "Template",
          none: "Nenhum",
        },
        confirmation: {
          errors: "Por favor, selecione uma ou mais conexões e um arquivo de disparo.",
          errorConnection: "Por favor, selecione uma ou mais conexões.",
          errorShots: "Por favor, selecione um arquivo de disparo.",
        },
        model:{
          line1: "NOME;CPF/CNPJ;TELEFONE;TEMPLATE_WHATS;PARAMETROS_TEMPLATE;TEXTO_MENSAGEM",
          line2: "- CAMPOS OPCIONAIS (SE TEXTO_MENSAGEM PREENCHIDO)",
          line3: "TEMPLATE_WHATS",
          line4: "PARAMETROS_TEMPLATE",
          line5: "- CAMPOS OPCIONAIS (SE TEMPLATE_WHATS PREENCHIDO)",
          line6: "TEXTO_MENSAGEM",
          line7: "PARAMETROS_TEMPLATE",
        },
      },

      users: {
        title: "Usuários",
        table: {
          name: "Nome",
          email: "Email",
          profile: "Perfil",
          actions: "Ações",
          companyName: "Nome da empresa",
        },
        buttons: {
          add: "Adicionar usuário",
        },
        toasts: {
          deleted: "Usuário excluído com sucesso.",
        },
        confirmationModal: {
          deleteTitle: "Excluir",
          deleteMessage:
            "Todos os dados do usuário serão perdidos. Os tickets abertos deste usuário serão movidos para a fila.",
        },
      },

      settings: {
        success: "Configurações salvas com sucesso.",
        title: "Configurações",
        settings: {
          userCreation: {
            name: "Criação de usuário",
            options: {
              enabled: "Ativado",
              disabled: "Desativado",
            },
          },
        },
      },

      reports: {
        title: "Relatório Conversa",
        buttons: {
          filter: "Filtrar relatórios",
          exportPdf: "Exportar PDF",
        },
        form: {
          initialDate: "Data inicial",
          finalDate: "Data final",
          user: "Usuário",
        },
        table: {
          messageId: "Id da Mensagem",
          messageBody: "Corpo da Mensagem",
          read: "Lida",
          mediaURL: "URL da Mídia",
          ticketId: "Id da Chamada",
          date: "Data",
        },
        errors:{
          toastErr: "Preencha todos os Campos!"
        },
      },

      reportsTicket: {
        title: "Relatório Chamadas",
        buttons: {
          ticketId: "Id da Chamada",
          filterReports: "Filtrar Relatórios",
          exportPdf: "Exportar Pdf",
        },
        grid: {
          messageId: "Id da Menssagem",
          bodyText: "Corpo da Mensagem",
          read: "Lida",
          ticketId: "Id da Chamada",
        },
        errors: {
          toastErr: "Selecione uma Chamada!"
        },
      },

      messagesList: {
        header: {
          assignedTo: "Atribuído à:",
          buttons: {
            return: "Retornar",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceitar",
          },
        },
      },
      messagesInput: {
        placeholderOpen:
          "Digite uma mensagem ou tecle ''/'' para utilizar as respostas rápidas cadastrada",
        placeholderClosed:
          "Reabra ou aceite essa chamada para enviar uma mensagem.",
        signMessage: "Assinar",
      },
      contactDrawer: {
        header: "Dados do contato",
        buttons: {
          edit: "Editar contato",
        },
        extraInfo: "Outras informações",
      },
      ticketOptionsMenu: {
        delete: "Deletar",
        transfer: "Transferir",
        confirmationModal: {
          title: "Deletar a chamada do contato",
          message:
            "Atenção! Todas as mensagens relacionadas a essa chamada serão perdidas.",
        },
        buttons: {
          delete: "Excluir",
          cancel: "Cancelar",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancelar",
        },
      },
      messageOptionsMenu: {
        delete: "Deletar",
        reply: "Responder",
        confirmationModal: {
          title: "Apagar mensagem?",
          message: "Esta ação não pode ser revertida.",
        },
      },
      templates: {
        title: "Templates",
        table: {
          name: "Nome",
          preview: "Prévia",
          category: "Categoria",
          classification: "Classificação",
          language: "Idioma",
          status: "Status",
          action: "Ações",
        },
        buttons: {
          newTemplate: "Nova Template",
          cancel: "Cancelar",
          add: "Adicionar",
          connection: "Conexões",
        },
        templateModal: {
          title: "Nova Template",
          name: "Nome",
          category: "Categoria",
          body: "Corpo",
          footer: "Rodapé",
          connection: "Conexões",
          transactional: "Transacional",
          marketing: "Marketing",
          edit: "Editar",
          cancel: "Cancelar",
          success: "Template criada com sucesso!",
          connectionFailed: "Favor selecione uma conexão!",
          delete: "Template excluida com sucesso!",
          toastErr: "Limite de parâmetros exedido!",
          selectVar: "Selecione uma Variável",
          document: "Documento",
          phoneNumber: "Número de Telefone",
          ok: "OK",
        },
      },

      logReport: {
        title: "Relatórios de Registros",
        select: {
          file: "Arquivo",
          status: "Status",
          all: "Todos",
          sent: "Enviados",
          delivered: "Entregues",
          read: "Lidos",
          errors: "Erros",
        },
        buttons: {
          createPdf: "Criar Pdf",
          exportPdf: "Exportar Pdf",
          exportCsv: "Exportar Csv",
          previousPage: "Página Anterior",
          nextPage: "Próxima Pàgina",
        },
        grid: {
          name: "Nome",
          sent: "Enviado",
          delivered: "Entregue",
          read: "Lido",
          errors: "Erro",
          status: "Status",
        },
      },

      settingsWhats:{
        title: "Configurações",
        triggerTime: "Tempo de Disparo entre as Instâncias",
        connections: "Conexões",
        all: "Todos",
        disconnected: "Conexões Desconectadas:",
        delete: "Algumas Conexões Foram Deletadas...",
        salutation: "Usar mensagem de saudação?",
        modal: {
          salutation: "Mensagem de saldação",
          actions: "Ações",
          edit: "Editar",
          delete: "Deletar",
          create: "Criar",
          edited: "Editar Mensagem de Saudação",
          createdAt: "Criar Mensagem de Saudação",
        },
        buttons: {
          save: "Salvar",
          activConfig: "Ativar Configuração",
          created: "Criar Mensagem",
        },
        confirmation: {
          updated: "Configuração alterada com sucesso!",
          saved: "Configuração salva com sucesso!",
          title: "Deletar Mensagem",
          confirmDelete: "Você tem certeza que deseja deletar esta mensagem de saudação?",
        },
      },

      historicTicket:{
          button: "Histórico",
        historicModal:{
          title: "Histórico",
          name: "Nome",
          message: "Mensagem",
          status: "Status",
          createAt: "Data Criação",
          actions: "Ações",
          closed: "Fechar",
          back: "Voltar"
        },
      },

      company:{
          title: "Empresas",
          search: "Pesquisar",
        grid:{
          companyId: "Id da Empresa",
          alias: "Pseudônimo",
          name: "Nome",
          cnpj: "CNPJ",
          phone: "Telefone",
          email: "Email",
          address:  "Endereço",
          actions: "Ações"
        },
        buttons: {
          addCompany: "Cadastrar Empresa"
        },
        companyModal: {
          titleAdd: "Adicionar Empresa",
          titleEdit: "Editar Cadastro da Empresa",
          alias: "Pseudônimo",
          name: "Nome da Empresa",
          cnpj: "CNPJ",
          phone: "Telefone",
          email: "Email",
          address: "Endereço",
          required: "Campo obrigatório!",
          invalidEmail: "Email Inválido!",
          image: "Tamanho excede o valor máximo de 1 Megabyte.",
          upload: "Carregar Logo",
          logo: "Sem logo",
        },
          success: "Empresa cadastrada com Sucesso!",
          deleteTitle: "Excluir Empresa, ",
          deleteCompany: "Todos os dados da empresa cadastrada serão perdidos, deseja realmente excluir, ",
          toast: "Empresa excluida com sucesso!",
          update: "Empresa atualizada com Sucesso!",
          createdAt: "Empresa criada com Sucesso!",
          edited: "Serviço editado com Sucesso!",
          create: "Serviço criado com Sucesso!",
        firebase: {
          yes: "Sim",
          no: "Não",
          title: "Adicione um serviço:",
          cancel: "Cancelar",
          ok: "OK",
          config: "Configurações Firebase",
          companyId: "Id da Empresa",
          connected: "Conectado",
          isFull: "Cheio",
          service: "Serviço",
          edit: "Editar",
          add: "Adicionar Serviço"
        },
      },

      menu:{
        title: "Menus",
        success: "Menu salvo com sucesso!",
        buttons:{
          save: "Salvar",
          menus: "Menus",
          company: "Empresas"
        },
      },

      templatesData:{
        title: "Templates Data",
        buttons: {
          connection: "Conexões",
          search: "Pesquisar",
          newTemplate: "Nova Template"
        },
        grid: {
          name: "Nome",
          status: "Status",
          text: "Texto",
          footer: "Rodapé",
          createdAt: "Data da Criação",
          updateAt: "Editado em",
          actions: "Ações",
        },
        templateModal: {
          add: "Adicionar Template",
          edit: "Editar Template",
          name: "Nome",
          bodyText: "Corpo do Texto",
          footer: "Rodapé",
          buttonAdd: "Adicionar",
          buttonEdit: "Salvar",
        },
        modalConfirm: {
          title: "Deletar Template",
          delete: "Deseja realmente excluir, todos os dados da Template serão perdidos!",
          successDelete: "Template Deletada com Sucesso!",
          successAdd: "Template Adicionada com Sucesso!",
          exceeded: "Limite de Parâmetros Excedido!",
          videoExceeded: "Tamanho do vídeo excede o valor máximo de 10 Megabyte.",
          edited: "Template atualizada com Sucesso!",

        },
        modal: {
          type: "Tipo",
          body: "Corpo",
          actions: "Ações",
          name: "Nome",
          addBody: "Adicionar ao Corpo",
          footer: "Rodapé",
          cancel: "Cancelar",
          edited: "Editar",
          created: "Criar",
          save: "Salvar",
          selectVar: "Selecione uma Variável",
          document: "Documento",
          phoneNumber: "Número de Telefone",
          ok: "OK",
          text: "Texto",
          audio: "Áudio",
          movie: "Vídeo",
          image: "Imagem",
          contact: "Contato",
          file: "Arquivo",
          load: "Carregar",
          order: "Ordem",
          value: "Valor",
          nameContact: "Nome do Contato",
        },
      },

      category: {
        title: "Categoria",
        buttons: {
          create: "Criar Categoria",
          edit: "Editar",
          add: "Criar"
        },
        grid: {
          name: "Nome",
          description: "Descrição",
          createdAt: "Data de Criação",
          action: "Ações",
        },
        categoryModal: {
          create: "Criar Categoria",
          edit: "Editar Categoria",
          cancel: "Cancelar",
          name: "Nome",
          description: "Descrição",
          select: "Selecione uma Descrição",
          none: "Nenhuma",
        },
        confirmation: {
          delete: "Categoria excluida com sucesso!",
          deleteTitle: "Excluir Categoria",
          deleteMsg: "Tem certeza que deseja excluir a categoria?",
          editMsg: "Categoria editada com sucesso!",
          addMsg: "Categoria adicionada com sucesso!",
        },
      },

      flows: {
        title: "Fluxos",
        buttons:{
          create: "Criar",
          search: "Pesquisar"
        },
        grid:{
          name: "Nome",
          status: "Status",
          createdAt: "Criado em",
          updatedAt: "Atualizado em",
          actions: "Ações",
        },
        flowsModal:{
          add: "Criar Fluxo",
          edit: "Editar Fluxo",
          name: "Nome",
          cancel: "Cancelar",
          create: "Criar",
          save: "salvar",
        },
        confirmation:{
          title: "Deletar Fluxo",
          create: "Fluxo Criado com Sucesso!",
          edit: "Fluxo Editado com Sucesso!",
          duplicate: "Fluxo Duplicado com Sucesso!",
          delete: "Fluxo deletado com sucesso!",
          confirmDelete: "Você tem certeza que deseja deletar este fluxo?",
        },
      },

      integratedImport: {
        title: "Importação Integrada",
        buttons:{
          createdImport: "Criar Importação"
        },
        grid:{
          createdAt: "Data da Criação",
          name: "Nome",
          method: "Método",
          registers: "Qtde de Registros",
          status: "Status",
          actions: "Ações"
        },
        integratedModal:{
          add: "Criar Importação",
          edited: "Editar importação",
          name: "Nome",
          method: "Método",
          url: "URL",
          autentication: "Autenticação",
          key: "Key",
          token: "Token",
          autentic: "Autenticar",
          in: "De",
          for: "Para",
          cancel: "Cancelar",
          save: "Salvar",
          edit: "Editar"
        },
        confirmation: {
          createdAt: "Importação adicionada com sucesso!",
          updatedAt: "Importação editada com sucesso!",
          delete: "Importação excluída com sucesso!",
          confirmDelete: "Todos os dados da importação se perderão, deseja realmente excluir?",
          title: "Deletar Importação",
        },
        status: {
          awaitingImport: "Aguardando Importação",
          processing: "Processando",
          awaitingApprove: "Aguardando Aprovação",
          err: "Erro",
          approve: "Aprovado",
          shooting: "Disparando",
          finished: "Finalizado",
          refused: "Recusado",
        },
      },

      payments: {
        title: "Pagamentos",
        grid: {
          company: "Empresa",
          month: "Mês",
          shotsValue: "Valor Total dos Disparos",
          monthValue: "Valor da Mensalidade",
          amounth: "Valor Total",
          amounthPaind: "Valor Pago",
          actions: "Ações"
        },
        modal:{
          title: "Hitórico de preço",
          date: "Data",
          value: "Valor",
          shots: "Disparos",
          freeShots: "Disparos Grátis",
          closed: "Fechar",
        },
      },

      pricing: {
        title: "Precificação",
        buttons: {
          create: "Criar",
        },
        grid: {
          company: "Empresa",
          registeredProduct: "Produto Cadastrado",
          status: "Status",
          gracePeriod: "Período de Carência (dias)",
          lackOfShots: "Carência de Disparos",
          customerSince: "Cliente Desde",
          actions: "Ações",
          active: "Ativo",
          inactive: "Inativo",
          defaulter: "Inadimplente",
          blocked: "Bloqueado",
        },
        pricingModal: {
          created: "Criar",
          edited: "Editar",
          company: "Empresa",
          product: "Produto",
          graceDays: "Carência (dias)",
          lackOfShots: "Carência de Disparos",
          cancel: "Cancelar",
          save: "Salvar",
          historic: "Histórico",
          closed: "Fechar",
          createdAt: "Criado",
          updatedAt: "Editado",
          deletedAt: "Deletado",
          by: " por ",
          update: "Atualizado: ",
          current: "Atual: ",
        },
        confirmation:{
          title: "Deletar Precificação",
          delete: "Precificação excluida com Sucesso!",
          confirmDelete: "Você realmente deseja excluir está precifição?",
          create: "Precificação criada com Sucesso!",
          edit: "Precificação editada com Sucesso!",
          titleEdit: "Editar Precificação",
          confirmEdit: "Você tem certeza que vai editar a precificação?",
        },
      },

      product:{
        title: "Produtos",
        buttons:{
          created: "Criar",
        },
        grid: {
          productName: "Nome do Produto",
          monthValue: "Valor da Mensalidade",
          tripCostValue: "Valor Custo Disparo",
          monthlyInterestRate: "Taxa juros Mensal",
          penaltyMount: "Multa Atraso",
          actions: "Ações",
        },
        productModal: {
          productName: "Nome do produto",
          monthValue: "Valor Mensal",
          shotsValue: "Valor do Disparo",
          interestRate: "Taxa de Juros",
          penaltyMount: "Multa Atraso",
          cancel: "Cancelar",
          created: "Criar",
          edited: "Editar",
          save: "Salvar",
        },
        confirmation: {
          delete: "Produto excluído com sucesso!",
          title: "Deletar Produto",
          confirmDelete: "Todos os dados do produto se perderão, deseja realmente excluir?",
          edited: "Produto atualizado com sucesso!",
          created: "Produto adicionado com sucesso!",
        },
      },

      registration: {
        title: "Cadastro",
        buttons: {
          new: "Novo Menu",
          search: "Pesquisar",
        },
        grid: {
          icon: "Ícone",
          name: "Nome",
          main: "Principal",
          relation: "Relação",
          createdAt: "Data da Criação",
          actions: "Ações",
        },
        registrationModal: {
          add: "Adicionar",
          edit: "Editar",
          name: "Nome",
          icon: "Ícone",
          main: "Pincipal",
          relation: "Relação",
          cancel: "Cancelar",
          created: "Criar",
          save: "Salvar",
          yes: "Sim",
          no: "Não",
          none: "Nenhum",
        },
        confirmation: {
          delete: "Cadastro excluído com sucesso!",
          title: "Excluir Cadastro",
          confirmDelete: "Todos os dados do cadastro se perderão, deseja realmente excluir?",
          update: "Menu atualizado com sucesso!",
          created: "Menu criado com sucesso!",
        },
      },

      locationPreview: {
        toView: "Visualizar",
        download: "Baixar",
        hello: "Diga olá ao seu novo contato!"
      },

      vcardPreview: {
        toTalk: "Conversar",
      },

      backendErrors: {
        ERR_NO_OTHER_WHATSAPP: "Deve haver pelo menos um WhatsApp padrão.",
        ERR_NO_DEF_WAPP_FOUND:
          "Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.",
        ERR_WAPP_CHECK_CONTACT:
          "Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões",
        ERR_WAPP_INVALID_CONTACT: "Este não é um número de Whatsapp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.",
        ERR_INVALID_CREDENTIALS:
          "Erro de autenticação. Por favor, tente novamente.",
        ERR_SENDING_WAPP_MSG:
          "Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
        ERR_DELETE_WAPP_MSG: "Não foi possível excluir a mensagem do WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Já existe um tíquete aberto para este contato.",
        ERR_SESSION_EXPIRED: "Sessão expirada. Por favor entre.",
        ERR_USER_CREATION_DISABLED:
          "A criação do usuário foi desabilitada pelo administrador.",
        ERR_NO_PERMISSION: "Você não tem permissão para acessar este recurso.",
        ERR_DUPLICATED_CONTACT: "Já existe um contato com este número.",
        ERR_NO_SETTING_FOUND: "Nenhuma configuração encontrada com este ID.",
        ERR_NO_CONTACT_FOUND: "Nenhum contato encontrado com este ID.",
        ERR_NO_TICKET_FOUND: "Nenhum tíquete encontrado com este ID.",
        ERR_NO_USER_FOUND: "Nenhum usuário encontrado com este ID.",
        ERR_NO_WAPP_FOUND: "Nenhum WhatsApp encontrado com este ID.",
        ERR_CREATING_MESSAGE: "Erro ao criar mensagem no banco de dados.",
        ERR_CREATING_TICKET: "Erro ao criar tíquete no banco de dados.",
        ERR_FETCH_WAPP_MSG:
          "Erro ao buscar a mensagem no WhtasApp, talvez ela seja muito antiga.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Esta cor já está em uso, escolha outra.",
        ERR_WAPP_GREETING_REQUIRED:
          "A mensagem de saudação é obrigatório quando há mais de uma fila.",
        ERR_NO_COMPANY_FOUND: "Erro ao excluir a Empresa.",
        ERR__SHORTCUT_DUPLICATED_COMPANY: "Já existe uma empresa com esse CNPJ.",
        ERR_NO_CATEGORY_FOUND : "Erro categoria não encontrada!"
      },
    },
  },
};

export { messages };
