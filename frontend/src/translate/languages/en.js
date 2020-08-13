const messages = {
	en: {
		translations: {
			signup: {
				title: "Sign up",
				toasts: {
					success: "User created successfully! Please login !!!.",
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
						title: "Tickets today:",
					},
				},
			},
			sessionInfo: {
				status: "Status:",
				battery: "Battery:",
				charging: "Loading:",
			},
			qrCode: {
				message: "Read QrCode to start the session",
			},
			contacts: {
				title: "Contacts",
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
					open: {
						title: "Inbox",
						assignedHeader: "Working on",
						pendingHeader: "Queue",
						openNoTicketsTitle: "Ready for more?",
						openNoTicketsMessage:
							"Accept a ticket from the queue to get started.",
						pendingNoTicketsTitle: "Everything is resolved!",
						pendingNoTicketsMessage: "No tickets pending.",
					},
					closed: { title: "Resolved" },
					search: {
						title: "Search",
						noTicketsTitle: "Nothing found!",
						noTicketsMessage: "Try searching for another term.",
					},
				},
				search: {
					placeholder: "Search tickets and messages.",
				},
				buttons: {
					showAll: "All",
				},
			},
			ticketsList: {
				buttons: {
					accept: "Accept",
				},
			},
			newTicketModal: {
				title: "Create Ticket",
				fieldLabel: "Type to search for the contact",
				buttons: {
					ok: "Save",
					cancel: "Cancel",
				},
			},
			mainDrawer: {
				listItems: {
					dashboard: "Dashboard",
					connection: "Connection",
					tickets: "Tickets",
					contacts: "Contacts",
				},
			},
			messagesList: {
				header: {
					assignedTo: "Assigned to:",
					buttons: {
						return: "Return",
						resolve: "Resolve",
						reopen: "Reopen",
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
			},
		},
	},
};

export { messages };
