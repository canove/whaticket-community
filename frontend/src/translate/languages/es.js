const messages = {
  es: {
    translations: {

      login: {
        title: "Inicio de Sesión",
        form: {
          company: "Empresa",
          email: "Correo Electrónico",
          password: "Contraseña",
        },
        buttons: {
          submit: "Ingresa",
        },
      },

      auth: {
        toasts: {
          success: "¡Inicio de sesión exitoso!",
        },
      },

      dashboard: {
        title: "Dashboard",
        file: "Archivo",
        date: "Fecha",
        charts: {
          perDay: {
            title: "Tickets hoy: ",
            calls: "Iiamadas"
          },
        },
        messages: {
          inAttendance: {
            title: "En Servicio"
          },
          waiting: {
            title: "Esperando"
          },
          closed: {
            title: "Finalizado"
          },
          imported: {
            title: "Importado"
          },
          sent: {
            title: "Enviado"
          },
          handedOut: {
            title: "Entregado"
          },
          read: {
            title: "Leer"
          },
          mistake: {
            title: "Errors"
          },
          category: {
            title: "Servicio por Categoría"
          },
        }
      },

      connections: {
        title: "Conexiones",
        toasts: {
          deleted:
            "¡La conexión de WhatsApp ha sido borrada satisfactoriamente!",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage: "¿Estás seguro? Este proceso no puede ser revertido.",
          disconnectTitle: "Desconectar",
          disconnectMessage: "Estás seguro? Deberá volver a leer el código QR",
        },
        buttons: {
          add: "Agrega WhatsApp",
          disconnect: "Desconectar",
          tryAgain: "Inténtalo de nuevo",
          qrcode: "QR CODE",
          newQr: "Nuevo QR CODE",
          connecting: "Conectando",
          previousPage: "Pagina Anterior",
          nextPage: "Siguuinte Página",
        },
        toolTips: {
          disconnected: {
            title: "No se pudo iniciar la sesión de WhatsApp",
            content:
              "Asegúrese de que su teléfono celular esté conectado a Internet y vuelva a intentarlo o solicite un nuevo código QR",
          },
          qrcode: {
            title: "Esperando la lectura del código QR",
            content:
              "Haga clic en el botón 'CÓDIGO QR' y lea el Código QR con su teléfono celular para iniciar la sesión",
          },
          connected: {
            title: "Conexión establecida",
          },
          timeout: {
            title: "Se perdió la conexión con el teléfono celular",
            content:
              "Asegúrese de que su teléfono celular esté conectado a Internet y que WhatsApp esté abierto, o haga clic en el botón 'Desconectar' para obtener un nuevo código QR",
          },
        },
        table: {
          name: "Nombre",
          status: "Estado",
          lastUpdate: "Última Actualización",
          createdAt: "Created At",
          default: "Por Defecto",
          actions: "Acciones",
          session: "Sesión",
          quality: "Calidad",
          limit: "Límite"
        },
      },

      officialConnections: {
        title: "Conexiones Oficiales",
        previousPage: "Página Anterior",
        nextPage: "Seguiente Página",
      },

      officialWhatsappModal: {
        title:{
        add:"Agregar Whatsapp Oficial",
        edit: "Para Editar WhatsApp Oficial",
        labelNumber: "Número de teléfono",
        labelToken: "Ficha de autenticación de Facebook",
        labelId: "Identificación de teléfono de Facebook",
        labelBusiness: "Identificación Comercial de Facebook",
        greetingMessage: "Mensaje de Saludo",
        farewellMessage: "Mensaje de Despedida",
        },
        buttons: {
          cancel: "Cancelar",
          testConnection: "Testar Conexion",
          add: "Agregar",
        },
      },

      whatsappModal: {
        title: {
          add: "Agrega WhatsApp",
          edit: "Edita WhatsApp",
        },
        form: {
          name: "Cellphone",
          default: "Por Defecto",
          farewellMessage: "Farewell Message",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "WhatsApp guardado satisfactoriamente.",
        required: "¡Campo obligatorio!",
        short: "¡Muy corto!",
        long: "¡Muy largo!",
      },

      qrCode: {
        message: "Lée el código QR para empezar la sesión.",
      },

      contacts: {
        title: "Contactos",
        toasts: {
          deleted: "¡Contacto borrado satisfactoriamente!",
          required: "¡Campo obligatorio!",
          short: "¡Demasiado corto!",
          long: "¡Se excedió el número de caracteres!",
          email: "¡Email inválido!"
        },
        searchPlaceholder: "Buscar...",
        confirmationModal: {
          deleteTitle: "Borrar",
          importTitlte: "Importar contactos",
          deleteMessage:
            "¿Estás seguro que deseas borrar este contacto? Todos los tickets relacionados se perderán.",
          importMessage:
            "¿Quieres importar todos los contactos desde tu teléfono?",
        },
        buttons: {
          import: "Importar Contactos",
          add: "Agregar Contacto",
        },
        table: {
          name: "Nombre",
          whatsapp: "WhatsApp",
          email: "Correo Electrónico",
          actions: "Acciones",
        },
      },

      contactModal: {
        title: {
          add: "Agregar contacto",
          edit: "Editar contacto",
        },
        form: {
          mainInfo: "Detalles del contacto",
          extraInfo: "Información adicional",
          name: "Nombre",
          number: "Número de Whatsapp",
          email: "Correo Electrónico",
          extraName: "Nombre del Campo",
          extraValue: "Valor",
        },
        buttons: {
          addExtraInfo: "Agregar información",
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Contacto guardado satisfactoriamente.",
      },

      userModal: {
        title: {
          add: "Agregar usuario",
          edit: "Editar usuario",
        },
        form: {
          name: "Nombre",
          email: "Correo Electrónico",
          password: "Contraseña",
          profile: "Perfil",
          language: "Language",
          user: "Usuario",
          admin: "Admin",
          company: "Compañía",
          languages: {
            pt: "Portuguese",
            en: "English",
            es: "Spanish",
          },
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Usuario guardado satisfactoriamente.",
        required: "¡Campo obligatorio!",
        short: "¡Muy corto!",
        long: "¡Muy largo!",
        email: "¡Email inválido!",
      },

      chat: {
        noTicketMessage: "Selecciona un ticket para empezar a chatear.",
      },

      ticketsManager: {
        buttons: {
          newTicket: "Nuevo",
        },
      },

      ticketsQueueSelect: {
        placeholder: "Linhas",
      },

      tickets: {
        toasts: {
          deleted: "El ticket en el que estabas ha sido borrado.",
          confirmDelete: "¡Ticket eliminado con éxito!",
        },
        notification: {
          message: "Mensaje de",
        },
        tabs: {
          open: { title: "Bandeja" },
          closed: { title: "Resueltos" },
          search: { title: "Buscar" },
        },
        search: {
          placeholder: "Buscar tickets y mensajes.",
        },
        buttons: {
          showAll: "Todos",
        },
      },

      transferTicketModal: {
        title: "Transferir Ticket",
        fieldLabel: "Escriba para buscar usuarios",
        fieldQueueLabel: "Transferir a la cola",
        fieldQueuePlaceholder: "Seleccione una cola",
        noOptions: "No se encontraron usuarios con ese nombre",
        buttons: {
          ok: "Transferir",
          cancel: "Cancelar",
        },
      },

      ticketsList: {
        pendingHeader: "Cola",
        assignedHeader: "Trabajando en",
        noTicketsTitle: "¡Nada acá!",
        noTicketsMessage:
          "No se encontraron tickets con este estado o término de búsqueda",
        buttons: {
          accept: "Acceptar",
        },
      },

      newTicketModal: {
        title: "Crear Ticket",
        fieldLabel: "Escribe para buscar un contacto",
        add: "Añadir",
        buttons: {
          ok: "Guardar",
          cancel: "Cancelar",
        },
      },

      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          template: "Plantilla",
          tickets: "Tickets",
          contacts: "Contactos",
          quickAnswers: "Respuestas rápidas",
          importation: "Importar",
          queues: "Linhas",
          administration: "Administración",
          users: "Usuarios",
          settings: "Configuración",
          reportsTalk: "Informe de Conversación",
          reportsTicket: "Informe de entradas",
          logReports: "Informes de Registro",
          reports: "Informes",
          whatsOff: "WhatsApp",
          whatsNoOff: "WhatsApp 2",
          company: "Compañías",
          menus: "Menus",
          fileImport: "Importación de Archivos",
          integratedImport:"Importación Integrada",
          category: "Categoría",
          adminBits: "Admin BITS",
          menuLink: "Enlace del Menú",
          registration: "Registro del Menú",
          finance: "Finanzas",
          products: "Producto",
          pricing: "Fijación de Precios",
          payments: "Pago",
          flows: "Fluye",
          connectionFiles: "Categories",
        },
        whatsApp: {
          connections: "Conexiones",
          officialConnections: "Conexiones",
          settings: "Configuración",
        },

        appBar: {
          user: {
            profile: "Perfil",
            logout: "Cerrar Sesión",
          },
        },
      },

      notifications: {
        noTickets: "Sin notificaciones.",
      },

      queues: {
        title: "Linhas",
        table: {
          name: "Nombre",
          color: "Color",
          greeting: "Mensaje de saludo",
          actions: "Comportamiento",
        },
        buttons: {
          add: "Agregar cola",
        },
        confirmationModal: {
          deleteTitle: "Eliminar",
          deleteMessage:
            "¿Estás seguro? ¡Esta acción no se puede revertir! Los tickets en esa cola seguirán existiendo, pero ya no tendrán ninguna cola asignada.",
          delete: "¡Cola eliminada con éxito!"
        },
      },

       queueModal: {
        title: {
          add: "Agregar cola",
          edit: "Editar cola",
        },
        form: {
          name: "Nombre",
          color: "Color",
          greetingMessage: "Mensaje de saludo",
          success: "¡Cola añadida con éxito!",
          edited: "¡Cola actualizada con éxito!",
          required: "¡Campo obligatorio!",
          short:"¡Muy corto!",
          long: "¡Muy largo!",
        },
        buttons: {
          okAdd: "Añadir",
          okEdit: "Ahorrar",
          cancel: "Cancelar",
        },
      },

      queueSelect: {
        inputLabel: "Linhas",
      },

      quickAnswers: {
        title: "Respuestas rápidas",
        table: {
          shortcut: "Atajo",
          message: "Respuesta rápida",
          actions: "Acciones",
        },
        buttons: {
          add: "Agregar respuesta rápida",
        },
        toasts: {
          deleted: "Respuesta rápida eliminada correctamente",
        },
        searchPlaceholder: "Buscar ...",
        confirmationModal: {
          deleteTitle:
            "¿Está seguro de que desea eliminar esta respuesta rápida?",
          deleteMessage: "Esta acción no se puede deshacer.",
        },
        yup: {
          required: "¡Campo obligatorio!",
          short: "¡Muy corto!",
          long: "¡Muy largo!",
        },
      },

      quickAnswersModal: {
        title: {
          add: "Agregar respuesta rápida",
          edit: "Editar respuesta rápida",
        },
        form: {
          shortcut: "Atajo",
          message: "Respuesta rápida",
        },
        buttons: {
          okAdd: "Agregar",
          okEdit: "Guardar",
          cancel: "Cancelar",
        },
        success: "Respuesta rápida guardada correctamente.",
        edited: "¡Respuesta rápida actualizada con éxito!",
      },

      importation: {
        title: "Importar Archivo",
        form: {
          status: "Estado",
          date: "Fecha",
          awaitingImport: "Esperando Importación",
          processing: "Procesando",
          waitingForApproval: "Esperando aprobación",
          error: "Error",
          aproved: "Aprobado",
          shooting: "Disparo",
          finished: "Acabado",
          refused: "Rechazado",
        },
        buttons: {
          import: "Importar Archivo",
          filter: "Filtrar",
          previousPage: "Página Anterior",
          nextPage: "Siguiente Página",
        },
        table: {
          uploadDate: "Fecha de Carga",
          fileName: "Nombre del Archivo",
          sentBy: "Enviado Por",
          numberOfRecords: "Número de Registros",
          status: "Estado",
          official: "Oficial",
          actions: "Comportamiento",
        },
        registryModal:{
          title: "Registros",
          id: "Id",
          name: "Nombre",
          template: "Template",
          message: "Mensaje",
          phoneNumber: "Número de Teléfono",
          documentNumber: "Número del Documento",
          cancel: "Cancelar",
          refuse: "Rechazar",
          approve: "Aprobar",
        },
      },

      importModal: {
        title: "Importar",
        buttons: {
          uploadFile: "Importar Archivo",
          cancel: "Cancelar",
          import: "Importar",
        },
        form: {
          shotType: "Tipo de Disparo",
          official: "Oficial",
          notOfficial: "No Oficial",
          noFile: "Sin Archivos Importados",
          uploadedFile: "Archivo Importado",
          supportedTriggerModel: "Modelo de Disparo Compatible",
          connection:"Conexiónes",
          selectAConnection: "Seleccione una Conexión",
          show: "Mostrar",
          toHide: "Esconder",
          all: "Todos",
          template: "Modelo",
          none: "Ninguma",
        },
        confirmation: {
          errors: "Seleccione una o más conexiones y un archivo desencadenante.",
          errorConnection: "Seleccione una o más conexiones.",
          errorShots:"Seleccione un archivo desencadenante.",
        },
        model:{
          line1: "NOMBRE;CPF/CNPJ;TELÉFONO;TEMPLATE_WHATS;PARAMETROS_TEMPLATE;TEXT_MESSAGE",
          line2: "- CAMPOS OPCIONALES (SI MENSAJE_TEXTO COMPLETO)",
          line3: "PLANTILLA_WHATS",
          line4: "PARAMETERS_TEMPLATE",
          line5: "- CAMPOS OPCIONALES (SI LA PLANTILLA_LO LLENÓ)",
          line6: "MENSAJE DE TEXTO",
          line7: "PARAMETERS_TEMPLATE",
        },
      },

      users: {
        title: "Usuarios",
        table: {
          name: "Nombre",
          email: "Correo Electrónico",
          profile: "Perfil",
          actions: "Acciones",
          companyName: "Nombre de la Empresa",
        },
        buttons: {
          add: "Agregar usuario",
        },
        toasts: {
          deleted: "Usuario borrado satisfactoriamente.",
        },
        confirmationModal: {
          deleteTitle: "Borrar",
          deleteMessage:
            "Toda la información del usuario se perderá. Los tickets abiertos de los usuarios se moverán a la cola.",
        },
      },

      settings: {
        success: "Configuración guardada satisfactoriamente.",
        title: "Configuración",
        settings: {
          userCreation: {
            name: "Creación de usuarios",
            options: {
              enabled: "Habilitado",
              disabled: "Deshabilitado",
            },
          },
        },
      },

      reports: {
        title: "Informes",
        buttons: {
          filter: "Filtrar informes",
          exportPdf: "Exportar PDF",
        },
        form: {
          initialDate: "Fecha inicial",
          finalDate: "Fecha final",
          user: "Usuario",
        },
        table: {
          messageId: "Mensaje Id",
          messageBody: "Cuerpo del Mensaje",
          read: "Leer",
          mediaURL: "URL de Medios",
          ticketId: "Identificación de Entradas",
          date: "Fecha",
        },
        errors:{
          toastErr: "¡Complete todos los campos!"
        },
      },

      reportsTicket: {
        title: "Informe de llamadas",
        buttons: {
          ticketId: "Id de llamadas",
          filterReports: "Filtrar Informes",
          exportPdf: "Exportar Pdf",
        },
        grid: {
          messageId: "Id del mensaje",
          bodyText: "Cuerpo del Mensaje",
          read: "Leer",
          ticketId: "Id de llamadas",
        },
        errors: {
          toastErr: "¡Seleccione una llamada!"
        },
      },

      messagesList: {
        header: {
          assignedTo: "Asignado a:",
          buttons: {
            return: "Devolver",
            resolve: "Resolver",
            reopen: "Reabrir",
            accept: "Aceptar",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Escriba un mensaje o presione '' / '' para usar las respuestas rápidas registradas",
        placeholderClosed:
          "Vuelva a abrir o acepte este ticket para enviar un mensaje.",
        signMessage: "Firmar",
      },
      contactDrawer: {
        header: "Detalles del contacto",
        buttons: {
          edit: "Editar contacto",
        },
        extraInfo: "Otra información",
      },
      ticketOptionsMenu: {
        delete: "Borrar",
        transfer: "Transferir",
        confirmationModal: {
          title: "¿Borrar ticket #",
          titleFrom: "del contacto ",
          message:
            "¡Atención! Todos los mensajes Todos los mensajes relacionados con el ticket se perderán.",
        },
        buttons: {
          delete: "Borrar",
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
        delete: "Borrar",
        reply: "Responder",
        confirmationModal: {
          title: "¿Borrar mensaje?",
          message: "Esta acción no puede ser revertida.",
        },
      },
      templates: {
          title: "Plantilla",
          table:{
            name: "Nombre",
            preview: "Avance",
            category: "Categoría",
            classification: "Clasificación",
            language: "Idioma",
            status: "Estado",
            action: "Comportamiento"
          },
          buttons:{
            newTemplate: "Nueva Plantilla",
            cancel: "Cancelar",
            add: "Agregar",
            connection: "Conexiones"
          },
          templateModal:{
            title: "Nueva Plantilla",
            name: "Nombre",
            category: "Categoría",
            body: "Cuerpo",
            footer: "Zócalo",
            connection: "Conexiones",
            transactional: "Transaccional",
            marketing: "Marketing",
            edit: "Para Editar",
            cancel: "Cancelar",
            success: "¡Plantilla creada con éxito!",
            connectionFailed: "¡Seleccione una conexión!",
            delete: "¡Plantilla eliminada con éxito!",
            toastErr: "¡Límite de parámetro excedido!",
            selectVar: "Seleccione una variable",
            document: "Documento",
            phoneNumber: "Número de Teléfono",
            ok: "OK",
          },
        },
        logReport:{
          title: "Informes de Registro",
          select:{
            file: "Archivo",
            status: "Estado",
            all: "Todos",
            sent: "Enviado",
            delivered: "Repartido",
            read: "Leer",
            errors: "Errores",
          },
          buttons:{
            createPdf: "Crea Pdf",
            exportPdf:  "Exportar Pdf",
            previous: "Anterior",
            exportCsv: "Exportar Csv",
            previousPage: "Página Anterior",
            nextPage: "Siguinte Página",
          },
          grid:{
            name: "Nombre",
            sent: "Enviado",
            delivered: "Repartido",
            read: "Leer",
            errors: "Errores",
            status: "Status",
          },
        },

      settingsWhats:{
        title: "Ajustes",
        triggerTime: "Tiempo de activación entre instancias",
        connections: "Conexiones",
        all: "Todos",
        disconnected: "Conexiones desconectadas:",
        delete: "Se han eliminado algunas conexiones...",
        salutation: "¿Usar mensaje de saludo?",
        modal: {
          salutation: "Mensaje de saludo",
          actions: "Comportamiento",
          edit: "Editar",
          delete: "Deletar",
          create: "Crear",
          edited: "Editar mensaje de saludo",
          createdAt: "Crear mensaje de saludo",
        },
        buttons: {
          save: "Ahorrar",
          activConfig: "Habilitar Configuración",
          created: "Crear un mensaje",
        },
        confirmation: {
          updated: "¡Configuración cambiada con éxito!",
          saved: "¡Configuración guardada con éxito!",
          title: "Borrar mensaje",
          confirmDelete: "¿Está seguro de que desea eliminar este mensaje de saludo?",
        },
      },

      historicTicket:{
        button: "Histórico",
      historicModal:{
        title: "Histórico",
        name: "Nombre",
        message: "Mensaje",
        status: "Estado",
        createAt: "Fecha de Creación",
        actions: "Comportamiento",
        closed: "Cerca",
        back: "Regresar"
        },
      },

      company:{
        title: "Compañías",
        search: "Búsqueda",
          grid:{
          companyId: "ID de la Compañía",
          alias: "Seudónimo",
          name: "Nombres",
          cnpj: "CNPJ",
          phone: "Teléfono",
          email: "Email",
          address:  "Endereço",
          actions: "Acción"
          },
          buttons: {
            addCompany: "Registrar Compañía"
          },
          companyModal: {
            titleAdd: "Añadir Compañía",
            titleEdit: "Editar Registro de Compañía",
            alias: "Seudónimo",
            name: "Nombre da Compañía",
            cnpj: "CNPJ",
            phone: "Teléfono",
            email: "Email",
            address: "Endereço",
            required: "¡Campo obligatorio!",
            invalidEmail: "¡Email inválido!",
            image: "El tamaño excede el valor máximo de 1 Megabyte.",
            upload: "Cargar logotipo",
            logo: "Sin logotipo",
          },
          success: "Compañía registrada con éxito!",
          deleteTitle: "Eliminar empresa, ",
          deleteCompany: "Todos los datos de la compañía registrada se perderán, ¿realmente desea eliminarlos? ",
          toast: "¡Compañía eliminada con éxito!",
          update: "¡Empresa actualizada con éxito!",
          createdAt: "¡Empresa creada con éxito!",
          edited: "¡Servicio editado con éxito!",
          create: "¡Servicio creado con éxito!",
        firebase: {
          yes: "Sí",
          no: "No",
          title: "Añadir un servicio:",
          cancel: "Cancelar",
          ok: "OK",
          config: "Configuración de Firebase",
          companyId: "Id de la Compañía",
          connected: "Conectado",
          isFull: "Cheio",
          service: "Servicio",
          edit: "Editar",
          add: "Agregar Servicio"
        },
      },

          menu:{
            title: "Menú",
            success: "¡Menú guardado con éxito!!",
          buttons:{
            save: "Guardar",
            menus: "Menú",
            company: "Compañías"
          },
        },
      templatesData:{
        title: "Plantillas",
        buttons: {
          connection: "Conexión",
          search: "Búsqueda",
          newTemplate: "Nueva Plantilla"
        },
        grid: {
          name: "Nombre",
          status: "Status",
          text: "Texto",
          footer: "Zócalo",
          createdAt: "Fecha de Creación",
          updateAt: "Editado en",
          actions: "Comportamiento",
        },
        templateModal: {
          add: "Agregar Plantilla",
          edit: "Editar Plantilla",
          name: "Nombre",
          bodyText: "cuerpo do Texto",
          footer: "Zócalo",
          buttonAdd: "Agregar",
          buttonEdit: "Editar",
        },
        modalConfirm: {
          title: "Eliminar plantilla",
          delete: "¿Realmente desea eliminar? ¡Se perderán todos los datos de la plantilla!",
          successDelete: "¡Plantilla eliminada con éxito!",
          successAdd: "¡Plantilla agregada con éxito!",
          exceeded: "¡Límite de parámetro excedido!",
          videoExceeded: "El tamaño del video excede el valor máximo de 10 Megabytes.",
          edited: "¡Plantilla actualizada con éxito!",
        },
        modal: {
          type: "Escribe",
          body: "Cuerpo",
          actions: "Acciones",
          name: "Nombre",
          addBody: "Agregar al cuerpo",
          footer: "Zócalo",
          cancel: "Cancelar",
          edited: "Editar",
          created: "Crear",
          save: "Ahorrar",
          selectVar: "Seleccione una variable",
          document: "Documento",
          phoneNumber: "Número de teléfono",
          ok: "OK",
          text: "Texto",
          audio: "Áudio",
          movie: "Vídeo",
          image: "Imagen",
          contact: "Contacto",
          file: "Archivo",
          load: "Para cargar",
          order: "Ordenar",
          value: "Valor",
          nameContact: "Nombre de contacto",
        },
      },

      category: {
        title: "Categoría",
        buttons: {
          create: "Crear Categoría",
          edit: "Para editar",
          add: "Crear",
        },
        grid: {
          name: "Nombre",
          description: "Descripción",
          createdAt: "Fecha de Creación",
          action: "Comportamiento",
        },
        categoryModal: {
          create: "Crear Categoría",
          edit: "Para editar Categoría",
          cancel: "Cancelar",
          name: "Nombre",
          description: "Descripción",
          select: "Seleccione una descripción",
          none: "Ninguma",
        },
        confirmation: {
          delete: "¡Categoría eliminada con éxito!",
          deleteTitle: "Eliminar categoría",
          deleteMsg: "¿Está seguro de que desea eliminar la categoría?",
          editMsg: "¡Categoría editada con éxito!",
          addMsg: "¡Categoría agregada con éxito!",
        },
      },

      flows: {
        title: "Fluye",
        buttons:{
          create: "Crear",
          search: "Búsqueda"
        },
        grid:{
          name: "Nombre",
          status: "Status",
          createdAt: "Creado en",
          updatedAt: "Actualizado en",
          actions: "Comportamiento",
        },
        flowsModal:{
          add: "Crear Flujo",
          edit: "Editar Flujo",
          name: "Nombre",
          cancel: "Cancelar",
          create: "Crear",
          save: "Ahorrar",
        },
        confirmation:{
          title: "Eliminar Flujo",
          create: "¡Flujo creado con éxito!",
          edit: "¡Flujo editado con éxito!",
          duplicate: "¡Flujo duplicado con éxito!",
          delete: "¡Flujo eliminado con éxito!",
          confirmDelete: "¿Está seguro de que desea eliminar esta transmisión?",
        },
      },

      integratedImport: {
        title: "Importación Integrada",
        buttons:{
          createdImport: "Crear Importación"
        },
        grid:{
          createdAt: "Fecha de Creación",
          name: "Nombre",
          method: "Método",
          registers: "Número de Registros",
          status: "Status",
          actions: "Comportamiento"
        },
        integratedModal:{
          add: "Crear Importación",
          edited: "Editar Importación",
          name: "Nombre",
          method: "Método",
          url: "URL",
          autentication: "Autenticación",
          key: "Key",
          token: "Token",
          autentic: "Autenticar",
          in: "De",
          for: "Para",
          cancel: "Cancelar",
          save: "Guardar",
          edit: "Editar",
        },
        confirmation: {
          createAt: "¡Importación agregada con éxito!",
          updatedAt: "¡Importación editada con éxito!",
          delete: "¡Importación eliminada con éxito!",
          confirmDelete: "Se perderán todos los datos de la importación, ¿realmente desea eliminarlos?",
          title: "Eliminar importación",
        },
        status: {
          awaitingImport: "Esperando Importación",
          processing: "Procesando",
          awaitingApprove: "Esperando aprobación",
          err: "Error",
          approve: "Aprobado",
          shooting: "Disparo",
          finished: "Acabado",
          refused: "Rechazado",
        },
      },

      payments: {
        title: "Pagos",
        grid: {
          company: "Compañías",
          month: "Mes",
          shotsValue: "Cantidad total de Disparos",
          monthValue: "Cuota Mensual",
          amounth: "Valor Total",
          amounthPaind: "Valor Pago",
          actions: "Comportamiento"
        },
        modal:{
          title: "Historial de precios",
          date: "Fecha",
          value: "Valor",
          shots: "Tiros",
          freeShots: "Tiros Gratis",
          closed: "Cerca",
        },
      },

      pricing: {
        title: "Fijación de Precios",
        buttons: {
          create: "Crear",
        },
        grid: {
          company: "Compañía",
          registeredProduct: "Producto Registrado",
          status: "Status",
          gracePeriod: "Periodo de Carencia (dias)",
          lackOfShots: "Falta de Disparos",
          customerSince: "Cliente Desde",
          actions: "Comportamiento",
          active: "Activo",
          inactive: "Inactivo",
          defaulter: "Moroso",
          blocked: "Obstruido",
        },
        pricingModal: {
          created: "Crear",
          edited: "Editar",
          company: "Compañía",
          product: "Producto",
          graceDays: "Carencia (dias)",
          lackOfShots: "Carencia de Disparos",
          cancel: "Cancelar",
          save: "Ahorrar",
          historic: "Histórico",
          closed: "Cerca",
          createdAt: "Creado",
          updatedAt: "Actualizado",
          deletedAt: "Eliminado",
          by: " por ",
          update: "Actualizado: ",
          current: "Actual: ",
        },
        confirmation:{
          title: "Eliminar precios",
          delete: "¡Precio eliminado con éxito!",
          confirmDelete: "¿Realmente desea eliminar este precio?",
          create: "¡Precio creado con éxito!",
          edit: "¡Precio editado con éxito!",
          titleEdit: "Editar precios",
          confirmEdit: "¿Estás seguro de que editarás el precio?",
        },
      },

      product:{
        title: "Productos",
        buttons:{
          created: "Crear",
        },
        grid: {
          productName: "Nombre del Producto",
          monthValue: "Cuota Mensual",
          tripCostValue: "Valor del Costo del Tiro",
          monthlyInterestRate: "Tasa de Interés Mensual",
          penaltyMount: "Bien Tarde",
          actions: "Comportamiento",
        },
        productModal: {
          productName: "Nombre del Producto",
          monthValue: "Cuota Mensual",
          shotsValue: "Valor del Tiro",
          interestRate: "Tasa de Interés",
          penaltyMount: "Bien Tarde",
          cancel: "Cancelar",
          created: "Crear",
          edited: "Editar",
          save: "Ahorrar",
        },
        confirmation: {
          delete: "¡Producto eliminado con éxito!",
          title: "Eliminar producto",
          confirmDelete: "Se perderán todos los datos del producto, ¿realmente desea eliminarlos?",
          edited: "¡Producto actualizado con éxito!",
          created: "¡Producto agregado con éxito!",
        },
      },

      registration: {
        title: "Registro",
        buttons: {
          new: "Nuevo Menú",
          search: "Búsqueda",
        },
        grid: {
          icon: "Icono",
          name: "Nombre",
          main: "Principal",
          relation: "Relación",
          createdAt: "Fecha de Creación",
          actions: "Comportamiento",
        },
        registrationModal: {
          add: "Agregar",
          edit: "Editar",
          name: "Nombre",
          icon: "Icono",
          main: "Pincipal",
          relation: "Relación",
          cancel: "Cancelar",
          created: "Crear",
          save: "Ahorrar",
          yes: "Sí",
          no: "No",
          none: "Ninguma",
        },
        confirmation: {
          delete: "¡Registro eliminado con éxito!",
          title: "Eliminar registro",
          confirmDelete: "Todos los datos de registro se perderán, ¿realmente desea eliminarlos?",
          update: "¡Menú actualizado con éxito!",
          created: "¡Menú creado con éxito!",
        },
      },

      locationPreview: {
        toView: "Visualizar",
        download: "Bajar",
        hello: "¡Saluda a tu nuevo contacto!"
      },

      vcardPreview: {
        toTalk: "Hablar",
      },

      connectionsFiles: {
        title: "Categories",
        buttons: {
          create: "Create",
        },
        categories: {
          noCategory: "No Categorizado"
        },
        table: {
          icon: "Icon",
          name: "Name",
          createdAt: "Created At",
          updatedAt: "Updated At",
          actions: "Actions"
        },
        modal: {
          create: "Create",
          edit: "Edit",
          name: "Name",
          file: "File",
          removeIcon: "Remove Icon",
          save: "Save",
          cancel: "Cancel",
        },
      },

      exposedImports: {
        title: "Exposed Imports",
        confirmationModal: "Are you sure that you want to delete this import?",
        create: "Create Import",
        grid: {
          name: "Name",
          registrationAmount: "Registration Amount",
          updatedAt: "Updated At",
          createdAt: "Created At",
          actions: "Actions",
        },
        modal: {
          createSuccess: "Exposed Import Created",
          editSuccess: "Exposed Import Saved",
          create: "Create",
          edit: "Edit",
          pastePayload: "Paste your payload here.",
          name: "Name",
          save: "Save",
          relations: "Relations",
          tutorial: "To use the payload use: ",
        },
      },

      chipReports: {
        title: "Chip Reports",
        status: {
          none: "None",
          connected: "Connected",
          disconnected: "Disconnected",
          deleted: "Deleted",
        },
        grid: {
          phoneNumber: "Phone Number",
          registerAmount: "Register Amount",
          createdAt: "Created At",
          updatedAt: "Updated At",
        },
      },

      nodeReports: {
        title: "Node Reports",
        phoneNumber: "Phone Number",
        text: "Text",
        response: "Response",
        nodeId: "Node Id",
        flow: "Flow",
        createdAt: "Created At",
        none: "None",
        true: "True",
        false: "False",
        exportCsv: "Export CSV",
      },

      backendErrors: {
        ERR_NO_OTHER_WHATSAPP:
          "Debe haber al menos una conexión de WhatsApp predeterminada.",
        ERR_NO_DEF_WAPP_FOUND:
          "No se encontró WhatsApp predeterminado. Verifique la página de conexiones.",
        ERR_WAPP_NOT_INITIALIZED:
          "Esta sesión de WhatsApp no ​​está inicializada. Verifique la página de conexiones.",
        ERR_WAPP_CHECK_CONTACT:
          "No se pudo verificar el contacto de WhatsApp. Verifique la página de conexiones.",
        ERR_WAPP_INVALID_CONTACT: "Este no es un número de whatsapp válido.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "No se pudieron descargar los medios de WhatsApp. Verifique la página de conexiones.",
        ERR_INVALID_CREDENTIALS: "Error de autenticación. Vuelva a intentarlo.",
        ERR_SENDING_WAPP_MSG:
          "Error al enviar el mensaje de WhatsApp. Verifique la página de conexiones.",
        ERR_DELETE_WAPP_MSG: "No se pudo borrar el mensaje de WhatsApp.",
        ERR_OTHER_OPEN_TICKET: "Ya hay un ticket abierto para este contacto.",
        ERR_SESSION_EXPIRED: "Sesión caducada. Inicie sesión.",
        ERR_USER_CREATION_DISABLED:
          "La creación de usuarios fue deshabilitada por el administrador.",
        ERR_NO_PERMISSION: "No tienes permiso para acceder a este recurso.",
        ERR_DUPLICATED_CONTACT: "Ya existe un contacto con este número.",
        ERR_NO_SETTING_FOUND:
          "No se encontró ninguna configuración con este ID.",
        ERR_NO_CONTACT_FOUND: "No se encontró ningún contacto con este ID.",
        ERR_NO_TICKET_FOUND: "No se encontró ningún ticket con este ID.",
        ERR_NO_USER_FOUND: "No se encontró ningún usuario con este ID.",
        ERR_NO_WAPP_FOUND: "No se encontró WhatsApp con este ID.",
        ERR_CREATING_MESSAGE: "Error al crear el mensaje en la base de datos.",
        ERR_CREATING_TICKET: "Error al crear el ticket en la base de datos.",
        ERR_FETCH_WAPP_MSG:
          "Error al obtener el mensaje en WhtasApp, tal vez sea demasiado antiguo.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "Este color ya está en uso, elija otro.",
        ERR_WAPP_GREETING_REQUIRED:
          "El mensaje de saludo es obligatorio cuando hay más de una cola.",
        ERR_NO_COMPANY_FOUND: "Error al eliminar empresa.",
        ERR__SHORTCUT_DUPLICATED_COMPANY: "Ya hay una empresa con este CNPJ.",
        ERR_NO_CATEGORY_FOUND : "¡Categoría de error no encontrada!",
      },
    },
  },
};

export { messages };
