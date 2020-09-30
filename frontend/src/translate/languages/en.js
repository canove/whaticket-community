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
					fail: "Authentication error. Please log in again",
				},
			},
			dashboard: {
				charts: {
					perDay: {
						title: "Tickets today: ",
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
				},
				buttons: {
					add: "Add WhatsApp",
				},
				table: {
					name: "Name",
					status: "Status",
					lastUpdate: "Last Update",
					default: "Default",
					actions: "Actions",
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
					importMessage:
						"Do you want to import all contacts from the phone? This function is experimental, you will have to reload the page after importing.",
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
				noOptions: "No contacts found. Try another name.",
				buttons: {
					ok: "Save",
					cancel: "Cancel",
				},
			},
			mainDrawer: {
				listItems: {
					dashboard: "Dashboard",
					connections: "Connections",
					tickets: "Tickets",
					contacts: "Contacts",
					administration: "Administration",
					users: "Users",
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
				placeholder: "Type a message",
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
		},
	},
};

export { messages };
