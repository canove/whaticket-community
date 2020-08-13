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
					fail: "Erro de autenticação. Por favor, faça login novamente",
				},
			},
			dashboard: {
				charts: {
					perDay: {
						title: "Tickets hoje: ",
					},
				},
			},
			sessionInfo: {
				status: "Status: ",
				battery: "Bateria: ",
				charging: "Carregando: ",
			},
			qrCode: {
				message: "Leia o QrCode para iniciar a sessão",
			},
			contacts: {
				title: "Contatos",
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
					open: {
						title: "Inbox",
						assignedHeader: "Atendendo",
						pendingHeader: "Aguardando",
						openNoTicketsTitle: "Pronto pra mais?",
						openNoTicketsMessage: "Aceite um ticket da fila para começar.",
						pendingNoTicketsTitle: "Tudo resolvido!",
						pendingNoTicketsMessage: "Nenhum ticket pendente.",
					},
					closed: { title: "Resolvidos" },
					search: {
						title: "Busca",
						noTicketsTitle: "Nada encontrado!",
						noTicketsMessage: "Tente pesquisar por outro termo.",
					},
				},
				search: {
					placeholder: "Pesquisar tickets e mensagens.",
				},
				buttons: {
					showAll: "Todos",
				},
			},
			ticketsList: {
				buttons: {
					accept: "Aceitar",
				},
			},
			newTicketModal: {
				title: "Criar Ticket",
				fieldLabel: "Digite para pesquisar o contato",
				buttons: {
					ok: "Salvar",
					cancel: "Cancelar",
				},
			},
			mainDrawer: {
				listItems: {
					dashboard: "Dashboard",
					connection: "Conexão",
					tickets: "Tickets",
					contacts: "Contatos",
				},
			},
			messagesList: {
				header: {
					assignedTo: "Atribuído à:",
					buttons: {
						return: "Retornar",
						resolve: "Resolver",
						reopen: "Reabrir",
					},
				},
			},
			messagesInput: {
				placeholder: "Digite uma mensagem",
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
			},
		},
	},
};

export { messages };
