const messages = {
  en: {
    translations: {

      login: {
        title: "Login",
        form: {
          company: "Company",
          email: "Email",
          password: "Password",
        },
        buttons: {
          submit: "Enter",
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
      date: "Date",
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
          },
          category: {
            title: "Service by Category",
          },
        },
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
          previousPage: "Previous Page",
          nextPage: "Next Page",
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
          createdAt: "Created At",
          default: "Default",
          actions: "Actions",
          session: "Session",
          quality: "Quality",
          limit: "Limit"
        },
      },

      officialConnections: {
        title: "Official Connections",
        previousPage: "Previous Page",
        nextPage: "Next Page",
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
          name: "Cellphone",
          default: "Default",
          farewellMessage: "Farewell Message",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
        },
        success: "WhatsApp saved successfully.",
        required: "Required!",
        short: "Too short!",
        long: "Too Long!",
      },

      qrCode: {
        message: "Read QrCode to start the session",
      },

      contacts: {
        title: "Contacts",
        toasts: {
          deleted: "Contact deleted sucessfully!",
          required: "Required!",
          short: "Too Short!",
          long: "Too Long!",
          email: "Invalid Email!"
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
          user: "User",
          admin: "Admin",
          company: "Company",
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
        required: "Required!",
        short: "Too Short!",
        long: "Too Long!",
        email: "Invalid Email!",
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
          confirmDelete: "Ticket deleted successfully!"
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
          whatsOff: "WhatsApp",
          whatsNoOff: "WhatsApp 2",
          company: "Companies",
          menus: "Menus",
          fileImport: "File Import",
          integratedImport:"Integrated Import",
          category: "Category",
          adminBits: "Admin BITS",
          menuLink: "Menu Link",
          registration: "Registration",
          finance: "Finance",
          products: "Products",
          pricing: "Pricing",
          payments: "Payments",
          flows: "Flows",
          connectionFiles: "Categories",
        },
        whatsApp: {
          connections: "Connections",
          officialConnections: "Connections",
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
          delete: "Successfully deleted queue!",
        },
      },

      queueModal: {
        title: {
          add: "Add queue",
          edit: "Edit queue",
          delete: "Successfully deleted queue!",
        },
        form: {
          name: "Name",
          color: "Color",
          greetingMessage: "Greeting Message",
          success: "Successfully added queue!",
          edited: "Queue Updated Successfully!",
          required: "Required!",
          short: "Too short!",
          long: "Too long!",
        },
        buttons: {
          okAdd: "Add",
          okEdit: "Save",
          cancel: "Cancel",
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
        yup: {
          required: "Required",
          short: "Too Short!",
          long: "Too Long!",
        },
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
        edited: "Quick reply successfully updated!",
      },

      importation: {
        title: "File Import",
        form: {
          status: "Status",
          date: "Date",
          awaitingImport: "Awaiting Import",
          processing: "Processing",
          waitingForApproval: "Waitiing Approval",
          error: "Error",
          aproved: "Aproved",
          shooting: "Shooting",
          finished: "Finished",
          refused: "Refused",
        },
        buttons: {
          import: "Import",
          filter: "Filter",
          previousPage: "Previous Page",
          nextPage: "Next Page",
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
          connection:"Connections",
          selectAConnection: "Select A Connetion",
          show: "Show",
          toHide: "To Hide",
          all: "All",
          template: "Template",
          none: "None",
        },
        confirmation: {
          errors: "Please select one or more connections and a trigger file.",
          errorConnection: "Please select one or more connections.",
          errorShots: "Please select a trigger file.",
        },
        model:{
          line1: "NAME;CPF/CNPJ;PHONE;TEMPLATE_WHATS;PARAMETROS_TEMPLATE;TEXT_MESSAGE",
          line2: "- OPTIONAL FIELDS (IF MESSAGE_TEXT FILLED IN)",
          line3: "TEMPLATE_WHATS",
          line4: "PARAMETERS_TEMPLATE",
          line5: "- OPTIONAL FIELDS (IF TEMPLATE_WHATS FILLED IN)",
          line6: "TEXT_MESSAGE",
          line7: "PARAMETERS_TEMPLATE",
        },
      },

      users: {
        title: "Users",
        table: {
          name: "Name",
          email: "Email",
          profile: "Profile",
          actions: "Actions",
          companyName: "Company Name",
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
          messageId: "Message Id",
          messageBody: "Body Message",
          read: "Read",
          mediaURL: "Media URL",
          ticketId: "Ticket Id",
          date: "Date",
        },
        errors:{
          toastErr: "Fill in all Fields!"
        },
      },

      reportsTicket: {
        title: "Reports Ticket",
        buttons: {
          ticketId: "Ticket Id",
          filterReports: "Filter Reports",
          exportPdf: "Export Pdf",
        },
        grid: {
          messageId: "Message Id",
          bodyText: "Body Text",
          read: "Read",
          ticketId: "Ticket Id",
        },
        errors: {
          toastErr: "Select a Call!"
        },
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
          success: "Template created successfully!",
          connectionFailed: "Please select a connection!",
          delete: "Template successfully deleted!",
          toastErr: "Parameter limit exceeded!",
          selectVar: "Select a Variable",
          document: "Document",
          phoneNumber: "Phone Number",
          ok: "OK",
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
          exportCsv: "Export Csv",
          previousPage: "Previous Page",
          nextPage: "Next Page",
        },
        grid:{
          name: "Name",
          sent: "Sent",
          delivered: "Delivered",
          read: "Read",
          errors: "Errors",
          status: "Status",
        },
      },

      settingsWhats:{
        title: "Settings",
        triggerTime: "Trigger Time Between Instances",
        connections: "Connections",
        all: "All",
        disconnected: "Disconnected Connections:",
        delete: "Some Connections Have Been Deleted...",
        salutation: "Use greeting message?",
        modal: {
          salutation: "Greeting message",
          actions: "Actions",
          edit: "Edited",
          delete: "Delete",
          create: "Create",
          edited: "Edit Greeting Message",
          createdAt: "Create Greeting Message",
        },
        buttons: {
          save: "Save",
          activConfig: "Enable Configuration",
          created: "Create Message",
        },
        confirmation: {
          updated: "Configuration changed successfully!",
          saved: "Configuration saved successfully!",
          title: "Delete Message",
          confirmDelete: "Are you sure you want to delete this greeting message?",
        },
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

      company:{
        title: "Companies",
        search: "Search",
          grid:{
          companyId: "Company Id",
          alias: "Alias",
          name: "Name",
          cnpj: "CNPJ",
          phone: "Phone",
          email: "Email",
          address:  "Address",
          actions: "Actions"
          },
          buttons: {
            addCompany: "Register Company"
          },
          companyModal: {
            titleAdd: "Add Company",
            titleEdit: "Edit Company Registration",
            alias: "Alias",
            name: "Company Name",
            cnpj: "CNPJ",
            phone: "Phone",
            email: "Email",
            address: "Address",
            required: "Required!",
            invalidEmail: "Invalid email!",
            image: "Size exceeds the maximum value of 1 Megabyte.",
            upload: "Upload Logo",
            logo: "No Logo"
          },
          success: "Company registered successfully!",
          deleteTitle: "Delete Company, ",
          deleteCompany: "All registered company data will be lost, do you really want to delete, ",
          toast: "Company successfully deleted!",
          update: "Company successfully updated!",
          createdAt: "Company successfully created!",
          edited: "Service edited successfully!",
          create: "Service created successfully!",
        firebase: {
          yes: "Yes",
          no: "No",
          title: "Add a service:",
          cancel: "Cancel",
          ok: "OK",
          config: "Firebase Settings",
          companyId: "Company Id",
          connected: "Connected",
          isFull: "Is Full",
          service: "Service",
          edit: "Edit",
          add: "Add Service"
        },
      },

        menu:{
            title: "Menus",
            success: "Menu saved successfully!",
          buttons:{
            save: "Save",
            menus: "Menus",
            company: "Companies"
          },
        },
      templatesData:{
        title: "Data Templates",
        buttons: {
          connection: "Connections",
          search: "Search",
          newTemplate: "Template New"
        },
        grid: {
          name: "Name",
          status: "Status",
          text: "Body Text",
          footer: "Footer",
          createdAt: "Created At",
          updateAt: "Update At",
          actions: "Actions",
        },
        templateModal: {
          add: "Add Template",
          edit: "Edit Template",
          name: "Name",
          bodyText: "Body Text",
          footer: "Footer",
          buttonAdd: "Add",
          buttonEdit: "Edit",
        },
        modalConfirm: {
          title: "Delete Template",
          delete: "Do you really want to delete, all Template data will be lost!",
          successDelete: "Successfully Deleted Template!",
          successAdd: "Template Added Successfully!",
          exceeded: "Parameter Limit Exceeded!",
          videoExceeded: "Video size exceeds the maximum value of 10 Megabyte.",
          edited: "Template Updated Successfully!",
        },
        modal: {
          type: "Type",
          body: "Body",
          actions: "Actions",
          name: "Name",
          addBody: "Add Body",
          footer: "Footer",
          cancel: "Cancel",
          edited: "Edit",
          created: "Create",
          save: "Save",
          selectVar: "Select a Variable",
          document: "Document",
          phoneNumber: "Phone Number",
          ok: "OK",
          text: "Text",
          audio: "Áudio",
          movie: "Vídeo",
          image: "Image",
          contact: "Contact",
          file: "File",
          load: "Upload",
          order: "Order",
          value: "Value",
          nameContact: "Contact Name",
        },
      },

      category: {
        title: "Category",
        buttons: {
          create: "Create Category",
          edit: "Edit",
          add: "Create",
        },
        grid: {
          name: "Name",
          description: "Description",
          createdAt: "Creation Date",
          action: "Actions",
        },
        categoryModal: {
          create: "Create Category",
          edit: "Edit Category",
          cancel: "Cancel",
          name: "Name",
          description: "Description",
          select: "Select a Description",
          none: "None",
        },
        confirmation: {
          delete: "Category deleted successfully!",
          deleteTitle: "Delete Category",
          deleteMsg: "Are you sure you want to delete the category?",
          editMsg: "Category edited successfully!",
          addMsg: "Category added successfully!",
        },
      },

      flows: {
        title: "Flows",
        buttons:{
          create: "Create",
          search: "Search"
        },
        grid:{
          name: "Name",
          status: "Status",
          createdAt: "Created At",
          updatedAt: "Updated At",
          actions: "Actions",
        },
        flowsModal:{
          add: "Create Flow",
          edit: "Edit Flow",
          name: "Name",
          cancel: "Cancel",
          create: "Create",
          save: "Save",
        },
        confirmation:{
          title: "Delete Flow",
          create: "Flow Created Successfully!",
          edit: "Flow Edited Successfully!",
          duplicate: "Successfully Duplicated Flow!",
          delete: "Flow deleted successfully!",
          confirmDelete: "Are you sure you want to delete this stream?",
        },
      },

      integratedImport: {
        title: "Integrated Import",
        buttons:{
          createdImport: "Create Import"
        },
        grid:{
          createdAt: "Create At",
          name: "Name",
          method: "Method",
          registers: "Registration Amount",
          status: "Status",
          actions: "Actions"
        },
        integratedModal:{
          add: "Create Import",
          edited: "Edit Import",
          name: "Name",
          method: "Method",
          url: "URL",
          autentication: "Autentication",
          key: "Key",
          token: "Token",
          autentic: "Authenticate",
          in: "In",
          for: "For",
          cancel: "Cancel",
          save: "Save",
          edit: "Edit",
        },
        confirmation: {
          createAt: "Import successfully added!",
          updatedAt: "Import edited successfully!",
          delete: "Import deleted successfully!",
          confirmDelete: "All data from import will be lost, do you really want to delete?",
          title: "Delete Import",
        },
        status: {
          awaitingImport: "Waiting for Import",
          processing: "Processing",
          awaitingApprove: "Waiting for approval",
          err: "Error",
          approve: "Aprove",
          shooting: "Shooting",
          finished: "Finished",
          refused: "Refused",
        },
      },

      payments: {
        title: "Payments",
        grid: {
          company: "Company",
          month: "Month",
          shotsValue: "Shots Value",
          monthValue: "Month Value",
          amounth: "Amounth",
          amounthPaind: "Amounth Paind",
          actions: "Actions"
        },
        modal:{
          title: "Price history",
          date: "Date",
          value: "Value",
          shots: "Shots",
          freeShots: "Free Shots",
          closed: "Closed",
        },
      },

      pricing: {
        title: "Pricing",
        buttons: {
          create: "Create",
        },
        grid: {
          company: "Company",
          registeredProduct: "Registered Product",
          status: "Status",
          gracePeriod: "Grace Period (days)",
          lackOfShots: "Lack of Shots",
          customerSince: "Customer Since",
          actions: "Actions",
          active: "Active",
          inactive: "Inactive",
          defaulter: "Dafauter",
          blocked: "Blocked",
        },
        pricingModal: {
          created: "Create",
          edited: "Edit",
          company: "Company",
          product: "Product",
          graceDays: "Grace (days)",
          lackOfShots: "Lack of Shots",
          cancel: "Cancel",
          save: "Save",
          historic: "Historic",
          closed: "Closed",
          createdAt: "Created",
          updatedAt: "Updated",
          deletedAt: "Deleted",
          by: " by ",
          update: "Updated: ",
          current: "Current: ",
        },
        confirmation:{
          title: "Delete Pricing",
          delete: "Pricing Deleted Successfully!",
          confirmDelete: "Do you really want to delete this pricing?",
          create: "Pricing created successfully!",
          edit: "Successfully edited pricing!",
          titleEdit: "Edit Pricing",
          confirmEdit: "Are you sure you will edit the pricing?",
        },
      },

      product:{
        title: "Products",
        buttons:{
          created: "Created",
        },
        grid: {
          productName: "Product Name",
          monthValue: "Month Value",
          tripCostValue: "Trigger Fee",
          monthlyInterestRate: "Monthly Interest Rate",
          penaltyMount: "Penalty Mount",
          actions: "Actions",
        },
        productModal: {
          productName: "Product Name",
          monthValue: "Month Value",
          shotsValue: "Shots Value",
          interestRate: "Interest Rate",
          penaltyMount: "Penalty Mount",
          cancel: "Cancel",
          created: "Created",
          edited: "Edited",
          save: "Save",
        },
        confirmation: {
          delete: "Product deleted successfully!",
          title: "Delete Product",
          confirmDelete: "All product data will be lost, do you really want to delete?",
          edited: "Product updated successfully!",
          created: "Product added successfully!",
        },
      },

      registration: {
        title: "Registration",
        buttons: {
          new: "New Menu",
          search: "Search",
        },
        grid: {
          icon: "Icon",
          name: "Name",
          main: "Main",
          relation: "Relation",
          createdAt: "Created At",
          actions: "Actions",
        },
        registrationModal: {
          add: "Add",
          edit: "Edit",
          name: "Name",
          icon: "Icon",
          main: "Main",
          relation: "Relation",
          cancel: "Cancel",
          created: "Create",
          save: "Save",
          yes: "Yes",
          no: "No",
          none: "None",
        },
        confirmation: {
          delete: "Record deleted successfully!",
          title: "Delete Registration",
          confirmDelete: "All registration data will be lost, do you really want to delete it?",
          update: "Menu updated successfully!",
          created: "Menu created successfully!",
        },
      },

      locationPreview: {
        toView: "To View",
        download: "Download",
        hello: "Say hello to your new contact!!"
      },

      vcardPreview: {
        toTalk: "To Talk",
      },

      connectionsFiles: {
        title: "Categories",
        buttons: {
          create: "Create",
        },
        categories: {
          noCategory: "Not Categorized"
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
        ERR_NO_COMPANY_FOUND: "Error deleting the Company.",
        ERR__SHORTCUT_DUPLICATED_COMPANY: "There is already a company with this CNPJ.",
        ERR_NO_CATEGORY_FOUND : "Error category not found!",
      },
    },
  },
};

export { messages };
