const messages = {
  en: {
    translations: {
      signup: {
        title: "Sign up",
        toasts: {
          success: "User created successfully! Please login!",
          fail: "Error creating user. Check the reported data.",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
        },
        buttons: {
          submit: "Register",
          login: "Already have an account? Log in!",
        },
      },
      login: {
        title: "Login",
        form: {
          email: "Email",
          password: "Password",
        },
        buttons: {
          submit: "Enter",
          register: "Don't have an account? Register!",
        },
      },
      auth: {
        toasts: {
          success: "Login successfully!",
        },
      },
      dashboard: {
      title: "Dashboard",
      file: "File",
        charts: {
          perDay: {
            title: "Tickets today: ",
            calls: "Calls",
          },
        },
        messages: {
          inAttendance: {
            title: "In Service"
          },
          waiting: {
            title: "Waiting"
          },
          closed: {
            title: "Closed"
          },
          imported: {
            title: "Imported"
          },
          sent: {
            title: "Sent"
          },
          handedOut: {
            title: "Hande Out"
          },
          read: {
            title: "Read"
          },
          mistake: {
            title: "Mistakes"
          }
        }
      },
      connections: {
        title: "Connections",
        toasts: {
          deleted: "WhatsApp connection deleted sucessfully!",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage: "Are you sure? It cannot be reverted.",
          disconnectTitle: "Disconnect",
          disconnectMessage: "Are you sure? You'll need to read QR Code again.",
        },
        buttons: {
          add: "Add WhatsApp",
          disconnect: "Disconnect",
          tryAgain: "Try Again",
          qrcode: "QR CODE",
          newQr: "New QR CODE",
          connecting: "Connectiing",
        },
        toolTips: {
          disconnected: {
            title: "Failed to start WhatsApp session",
            content:
              "Make sure your cell phone is connected to the internet and try again, or request a new QR Code",
          },
          qrcode: {
            title: "Waiting for QR Code read",
            content:
              "Click on 'QR CODE' button and read the QR Code with your cell phone to start session",
          },
          connected: {
            title: "Connection established",
          },
          timeout: {
            title: "Connection with cell phone has been lost",
            content:
              "Make sure your cell phone is connected to the internet and WhatsApp is open, or click on 'Disconnect' button to get a new QRcode",
          },
        },
        table: {
          name: "Name",
          status: "Status",
          lastUpdate: "Last Update",
          default: "Default",
          actions: "Actions",
          session: "Session",
          quality: "Quality",
          limit: "Limit"
        },
      },
      officialConnections: {
        title: "Official Connections",
      },
      officialWhatsappModal: {
        title:{
        add:"Add Official WhatsApp",
        edit: "Edit WhatsApp Official",
        labelNumber: "Phone Number",
        labelToken: "Facebook Authentication Token",
        labelId: "Facebook Phone Id",
        labelBusiness: "Facebook Business Id",
        greetingMessage: "Greeting Message",
        farewellMessage: "Farewell Message",
        },
        buttons: {
          cancel: "Cancel",
          testConnection: "Test Connection",
          add: "Add",
        },
      },

      whatsappModal: {
        title: {
          add: "Add WhatsApp",
          edit: "Edit WhatsApp",
        },
        form: {
          name: "Name",
          default: "Default",
          farewellMessage: "Farewell Message",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "WhatsApp saved successfully.",
      },
      qrCode: {
        message: "Read QrCode to start the session",
      },
      contacts: {
        title: "Contacts",
        toasts: {
          deleted: "Contact deleted sucessfully!",
        },
        searchPlaceholder: "Search ...",
        confirmationModal: {
          deleteTitle: "Delete",
          importTitlte: "Import contacts",
          deleteMessage:
            "Are you sure you want to delete this contact? All related tickets will be lost.",
          importMessage: "Do you want to import all contacts from the phone?",
        },
        buttons: {
          import: "Import Contacts",
          add: "Add Contact",
        },
        table: {
          name: "Name",
          whatsapp: "WhatsApp",
          email: "Email",
          actions: "Actions",
        },
      },
      contactModal: {
        title: {
          add: "Add contact",
          edit: "Edit contact",
        },
        form: {
          mainInfo: "Contact details",
          extraInfo: "Additional information",
          name: "Name",
          number: "Whatsapp number",
          email: "Email",
          extraName: "Field name",
          extraValue: "Value",
        },
        buttons: {
          addExtraInfo: "Add information",
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Contact saved successfully.",
      },
      quickAnswersModal: {
        title: {
          add: "Add Quick Reply",
          edit: "Edit Quick Answer",
        },
        form: {
          shortcut: "Shortcut",
          message: "Quick Reply",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "Quick Reply saved successfully.",
      },
      queueModal: {
        title: {
          add: "Add queue",
          edit: "Edit queue",
        },
        form: {
          name: "Name",
          color: "Color",
          greetingMessage: "Greeting Message",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
      },
      userModal: {
        title: {
          add: "Add user",
          edit: "Edit user",
        },
        form: {
          name: "Name",
          email: "Email",
          password: "Password",
          profile: "Profile",
          language: "Language",
          languages: {
            pt: "Portuguese",
            en: "English",
            es: "Spanish",
          },
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "User saved successfully.",
      },
      chat: {
        noTicketMessage: "Select a ticket to start chatting.",
      },
      ticketsManager: {
        buttons: {
          newTicket: "New",
        },
      },
      ticketsQueueSelect: {
        placeholder: "Queues",
      },
      tickets: {
        toasts: {
          deleted: "The ticket you were on has been deleted.",
        },
        notification: {
          message: "Message from",
        },
        tabs: {
          open: { title: "Inbox" },
          closed: { title: "Resolved" },
          search: { title: "Search" },
        },
        search: {
          placeholder: "Search tickets and messages.",
        },
        buttons: {
          showAll: "All",
        },
      },
      transferTicketModal: {
        title: "Transfer Ticket",
        fieldLabel: "Type to search for users",
        fieldQueueLabel: "Transfer to queue",
        fieldQueuePlaceholder: "Please select a queue",
        noOptions: "No user found with this name",
        buttons: {
          ok: "Transfer",
          cancel: "Cancel",
        },
      },
      ticketsList: {
        pendingHeader: "Queue",
        assignedHeader: "Working on",
        noTicketsTitle: "Nothing here!",
        noTicketsMessage: "No tickets found with this status or search term.",
        buttons: {
          accept: "Accept",
        },
      },
      newTicketModal: {
        title: "Create Ticket",
        fieldLabel: "Type to search for a contact",
        add: "Add",
        buttons: {
          ok: "Save",
          cancel: "Cancel",
        },
      },
      mainDrawer: {
        listItems: {
          dashboard: "Dashboard",
          template: "Templates",
          tickets: "Tickets",
          contacts: "Contacts",
          quickAnswers: "Quick Answers",
          importation: "Import",
          queues: "Queues",
          administration: "Administration",
          users: "Users",
          settings: "Settings",
          reportsTalk: "Talk Reports",
          reportsTicket: "Ticket Report",
          logReports: "Log Reports",
          reports: "Reports",
        },
        whatsApp: {
          connections: "Connections",
          officialConnections: "Official Connections",
          settings: "Settings",
        },

        appBar: {
          user: {
            profile: "Profile",
            logout: "Logout",
          },
        },
      },
      notifications: {
        noTickets: "No notifications.",
      },
      queues: {
        title: "Queues",
        table: {
          name: "Name",
          color: "Color",
          greeting: "Greeting message",
          actions: "Actions",
        },
        buttons: {
          add: "Add queue",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage:
            "Are you sure? It cannot be reverted! Tickets in this queue will still exist, but will not have any queues assigned.",
        },
      },
      queueSelect: {
        inputLabel: "Queues",
      },
      quickAnswers: {
        title: "Quick Answers",
        table: {
          shortcut: "Shortcut",
          message: "Quick Reply",
          actions: "Actions",
        },
        buttons: {
          add: "Add Quick Reply",
        },
        toasts: {
          deleted: "Quick Reply deleted successfully.",
        },
        searchPlaceholder: "Search...",
        confirmationModal: {
          deleteTitle: "Are you sure you want to delete this Quick Reply: ",
          deleteMessage: "This action cannot be undone.",
        },
      },
      importation: {
        title: "Import",
        form: {
          status: "Status",
          date: "Date",
        },
        buttons: {
          import: "Import",
          filter: "Filter",
        },
        table: {
          uploadDate: "Upload Date",
          fileName: "File Name",
          sentBy: "Sent By",
          numberOfRecords: "Number of Records",
          status: "Status",
          official: "Official",
          actions: "Actions",
        },
        registryModal:{
          title: "Registry",
          id: "Id",
          name: "Name",
          template: "Template",
          message: "Message",
          phoneNumber: "Phone Number",
          documentNumber: "Document Number",
          cancel: "Cancel",
          refuse: "Refuse",
          approve: "To Approve",
        },
      },
      importModal: {
        title: "Import",
        buttons: {
          uploadFile: "Upload File",
          cancel: "Cancel",
          import: "Import",
        },
        form: {
          noFile: "No File Uploaded",
          uploadedFile: "Uploaded File",
          shotType: "Shot Type",
          official: "Official",
          notOfficial: "Not Official",
          supportedTriggerModel: "Supported Trigger Model",
          connection:"Connection",
          selectAConnection: "Select A Connetion",
          show: "Show",
          toHide: "To Hide",
        },
      },
      users: {
        title: "Users",
        table: {
          name: "Name",
          email: "Email",
          profile: "Profile",
          actions: "Actions",
        },
        buttons: {
          add: "Add user",
        },
        toasts: {
          deleted: "User deleted sucessfully.",
        },
        confirmationModal: {
          deleteTitle: "Delete",
          deleteMessage:
            "All user data will be lost. Users' open tickets will be moved to queue.",
        },
      },
      settings: {
        success: "Settings saved successfully.",
        title: "Settings",
        settings: {
          userCreation: {
            name: "User creation",
            options: {
              enabled: "Enabled",
              disabled: "Disabled",
            },
          },
        },
      },
      reports: {
        title: "Reports",
        buttons: {
          filter: "Filter reports",
          exportPdf: "Export PDF",
        },
        form: {
          initialDate: "Initial date",
          finalDate: "Final date",
          user: "User",
        },
        table: {
          messageId: "Message ID",
          messageBody: "Message Body",
          read: "Read",
          mediaURL: "Media URL",
          ticketId: "Ticket ID",
          date: "Date",
        }
      },
      reportsTicket: {
        title: "Reports Ticket",
      },
      messagesList: {
        header: {
          assignedTo: "Assigned to:",
          buttons: {
            return: "Return",
            resolve: "Resolve",
            reopen: "Reopen",
            accept: "Accept",
          },
        },
      },
      messagesInput: {
        placeholderOpen: "Type a message or press ''/'' to use the registered quick responses",
        placeholderClosed: "Reopen or accept this ticket to send a message.",
        signMessage: "Sign",
      },
      contactDrawer: {
        header: "Contact details",
        buttons: {
          edit: "Edit contact",
        },
        extraInfo: "Other information",
      },
      ticketOptionsMenu: {
        delete: "Delete",
        transfer: "Transfer",
        confirmationModal: {
          title: "Delete ticket #",
          titleFrom: "from contact ",
          message: "Attention! All ticket's related messages will be lost.",
        },
        buttons: {
          delete: "Delete",
          cancel: "Cancel",
        },
      },
      confirmationModal: {
        buttons: {
          confirm: "Ok",
          cancel: "Cancel",
        },
      },
      messageOptionsMenu: {
        delete: "Delete",
        reply: "Reply",
        confirmationModal: {
          title: "Delete message?",
          message: "This action cannot be reverted.",
        },
      },

    templates: {
        title: "Templates",
        table:{
          name: "Name",
          preview: "Preview",
          category: "Category",
          classification: "Classification",
          language: "Language",
          status: "Status",
          action: "Actions",
        },
        buttons:{
          newTemplate: "New Template",
          cancel: "Cancel",
          add: "Add",
          connection: "Connections"
        },
        templateModal:{
          title: "New Template",
          name: "Name",
          category: "Category",
          body: "Body",
          footer: "Footer",
          connection: "Connections",
          transactional: "Transactional",
          marketing: "Marketing",
          edit: "To Edit",
          cancel: "Cancel",
        },
      },

      logReport:{
        title: "Log Reports",
        select:{
          file: "Files",
          status: "Status",
          all: "All",
          sent: "Sent",
          delivered: "Delivered",
          read: "Read",
          errors: "Errors",
        },
        buttons:{
          createPdf: "Create Pdf",
          exportPdf:  "Export Pdf",
          previous: "Previous",
          next: "Next",
          page: "Page: ",
        },
        grid:{
          name: "Name",
          sent: "Sent",
          delivered: "Delivered",
          read: "Read",
          errors: "Errors"
        },
      },

      settingsWhats:{
        title: "Settings",
        triggerTime: "Trigger Time Between Instances",
        connections: "Connections",
        all: "All",
      },

      historicTicket:{
        button: "Historic",
      historicModal:{
        title: "Historic",
        name: "Name",
        message: "Message",
        status: "Status",
        createAt: "Create At",
        actions: "Actions",
        closed: "Close",
        back: "Back",
        },
      },

      backendErrors: {
        ERR_NO_OTHER_WHATSAPP:
          "There must be at lest one default WhatsApp connection.",
        ERR_NO_DEF_WAPP_FOUND:
          "No default WhatsApp found. Check connections page.",
        ERR_WAPP_NOT_INITIALIZED:
          "This WhatsApp session is not initialized. Check connections page.",
        ERR_WAPP_CHECK_CONTACT:
          "Could not check WhatsApp contact. Check connections page.",
        ERR_WAPP_INVALID_CONTACT: "This is not a valid whatsapp number.",
        ERR_WAPP_DOWNLOAD_MEDIA:
          "Could not download media from WhatsApp. Check connections page.",
        ERR_INVALID_CREDENTIALS: "Authentication error. Please try again.",
        ERR_SENDING_WAPP_MSG:
          "Error sending WhatsApp message. Check connections page.",
        ERR_DELETE_WAPP_MSG: "Couldn't delete message from WhatsApp.",
        ERR_OTHER_OPEN_TICKET:
          "There's already an open ticket for this contact.",
        ERR_SESSION_EXPIRED: "Session expired. Please login.",
        ERR_USER_CREATION_DISABLED:
          "User creation was disabled by administrator.",
        ERR_NO_PERMISSION: "You don't have permission to access this resource.",
        ERR_DUPLICATED_CONTACT: "A contact with this number already exists.",
        ERR_NO_SETTING_FOUND: "No setting found with this ID.",
        ERR_NO_CONTACT_FOUND: "No contact found with this ID.",
        ERR_NO_TICKET_FOUND: "No ticket found with this ID.",
        ERR_NO_USER_FOUND: "No user found with this ID.",
        ERR_NO_WAPP_FOUND: "No WhatsApp found with this ID.",
        ERR_CREATING_MESSAGE: "Error while creating message on database.",
        ERR_CREATING_TICKET: "Error while creating ticket on database.",
        ERR_FETCH_WAPP_MSG:
          "Error fetching the message in WhtasApp, maybe it is too old.",
        ERR_QUEUE_COLOR_ALREADY_EXISTS:
          "This color is already in use, pick another one.",
        ERR_WAPP_GREETING_REQUIRED:
          "Greeting message is required if there is more than one queue.",
      },
    },
  },
};

export { messages };
