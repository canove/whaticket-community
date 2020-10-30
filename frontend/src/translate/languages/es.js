const messages = {
	es: {
		translations: {
			signup: {
				title: "Registro",
				toasts: {
					success:
						"¡El usuario ha sido creado satisfactoriamente! ¡Ahora inicia sesión!",
					fail: "Error creando el usuario. Verifica la data reportada.",
				},
				form: {
					name: "Nombre",
					email: "Correo Electrónico",
					password: "Contraseña",
				},
				buttons: {
					submit: "Regístrate",
					login: "¿Ya tienes una cuenta? ¡Inicia sesión!",
				},
			},
			login: {
				title: "Inicio de Sesión",
				form: {
					email: "Correo Electrónico",
					password: "Contraseña",
				},
				buttons: {
					submit: "Ingresa",
					register: "¿No tienes cuenta? ¡Regístrate!",
				},
			},
			auth: {
				toasts: {
					success: "¡Inicio de sesión exitoso!",
				},
			},
			dashboard: {
				charts: {
					perDay: {
						title: "Tickets hoy: ",
					},
				},
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
					default: "Por Defecto",
					actions: "Acciones",
					session: "Sesión",
				},
			},
			whatsappModal: {
				title: {
					add: "Agrega WhatsApp",
					edit: "Edita WhatsApp",
				},
				form: {
					name: "Nombre",
					default: "Por Defecto",
				},
				buttons: {
					okAdd: "Agregar",
					okEdit: "Guardar",
					cancel: "Cancelar",
				},
				success: "WhatsApp guardado satisfactoriamente.",
			},
			qrCode: {
				message: "Lée el código QR para empezar la sesión.",
			},
			contacts: {
				title: "Contactos",
				toasts: {
					deleted: "¡Contacto borrado satisfactoriamente!",
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
				},
				buttons: {
					okAdd: "Agregar",
					okEdit: "Guardar",
					cancel: "Cancelar",
				},
				success: "Usuario guardado satisfactoriamente.",
			},
			chat: {
				noTicketMessage: "Selecciona un ticket para empezar a chatear.",
			},
			tickets: {
				toasts: {
					deleted: "El ticket en el que estabas ha sido borrado.",
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
					connections: "Conexiones",
					tickets: "Tickets",
					contacts: "Contactos",
					administration: "Administración",
					users: "Usuarios",
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
			users: {
				title: "Usuarios",
				table: {
					name: "Nombre",
					email: "Correo Electrónico",
					profile: "Perfil",
					actions: "Acciones",
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
				placeholderOpen: "Escribe un mensaje",
				placeholderClosed:
					"Vuelva a abrir o acepte este ticket para enviar un mensaje.",
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
			backendErrors: {
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
			},
		},
	},
};

export { messages };
