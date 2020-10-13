const messages = {
	pt: {
		translations: {
			signup: {
				title: "Cadastre-se",
				toasts: {
					success: "Usuário criado com sucesso! Faça seu login!!!.",
					fail: "Erro ao criar usuário. Verifique os dados informados.",
				},
				form: {
					name: "Nome",
					email: "Email",
					password: "Senha",
				},
				buttons: {
					submit: "Cadastrar",
					login: "Já tem uma conta? Entre!",
				},
			},
			login: {
				title: "Login",
				form: {
					email: "Email",
					password: "Senha",
				},
				buttons: {
					submit: "Entrar",
					register: "Não tem um conta? Cadastre-se!",
				},
			},
			auth: {
				toasts: {
					success: "Login efetuado com sucesso!",
				},
			},
			dashboard: {
				charts: {
					perDay: {
						title: "Tickets hoje: ",
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
				},
				buttons: {
					add: "Adicionar WhatsApp",
				},
				table: {
					name: "Nome",
					status: "Status",
					lastUpdate: "Última atualização",
					default: "Padrão",
					actions: "Ações",
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
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
				},
				success: "WhatsApp salvo com sucesso.",
			},
			qrCode: {
				message: "Leia o QrCode para iniciar a sessão",
			},
			contacts: {
				title: "Contatos",
				toasts: {
					deleted: "Contato excluído com sucesso!",
				},
				searchPlaceholder: "Pesquisar...",
				confirmationModal: {
					deleteTitle: "Deletar ",
					importTitlte: "Importar contatos",
					deleteMessage:
						"Tem certeza que deseja deletar este contato? Todos os tickets relacionados serão perdidos.",
					importMessage:
						"Deseja importas todos os contatos do telefone? Essa função é experimental, você terá que recarregar a página após a importação.",
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
				},
				buttons: {
					okAdd: "Adicionar",
					okEdit: "Salvar",
					cancel: "Cancelar",
				},
				success: "Usuário salvo com sucesso.",
			},
			chat: {
				noTicketMessage: "Selecione um ticket para começar a conversar.",
			},
			tickets: {
				toasts: {
					deleted: "O ticket que você estava foi deletado.",
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
					placeholder: "Buscar tickets e mensagens",
				},
				buttons: {
					showAll: "Todos",
				},
			},
			ticketsList: {
				pendingHeader: "Aguardando",
				assignedHeader: "Atendendo",
				noTicketsTitle: "Nada aqui!",
				noTicketsMessage:
					"Nenhum ticket encontrado com esse status ou termo pesquisado",
				buttons: {
					accept: "Aceitar",
				},
			},
			newTicketModal: {
				title: "Criar Ticket",
				fieldLabel: "Digite para pesquisar o contato",
				noOptions: "Nenhum contato encontrado. Tente outro nome.",
				buttons: {
					ok: "Salvar",
					cancel: "Cancelar",
				},
			},
			mainDrawer: {
				listItems: {
					dashboard: "Dashboard",
					connections: "Conexões",
					tickets: "Tickets",
					contacts: "Contatos",
					administration: "Administração",
					users: "Usuários",
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
			users: {
				title: "Usuários",
				table: {
					name: "Nome",
					email: "Email",
					profile: "Perfil",
					actions: "Ações",
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
				placeholderOpen: "Digite uma mensagem",
				placeholderClosed:
					"Reabra ou aceite esse ticket para enviar uma mensagem.",
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
					title: "Deletar o ticket #",
					titleFrom: "do contato ",
					message:
						"Atenção! Todas as mensagens relacionadas ao ticket serão perdidas.",
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
			backendErrors: {
				ERR_NO_WAPP_FOUND:
					"Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.",
				ERR_INVALID_CREDENTIALS:
					"Erro de autenticação. Por favor, tente novamente.",
				ERR_SENDING_WAPP_MSG:
					"Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.",
				ERR_DELETE_WAPP_MSG:
					"Não foi possível excluir a mensagem do WhatsApp. Verifique a página de conexões.",
				ERR_OTHER_OPEN_TICKET:
					"Já existe um tíquete aberto ou pendente para este contato.",
			},
		},
	},
};

export { messages };
