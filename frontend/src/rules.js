const rules = {
	user: {
		static: [],
	},

	admin: {
		static: [
			"drawer-admin-items:view",
			"tickets-manager:showall",
			"user-modal:editProfile",
			"user-modal:editQueues",
			"ticket-options:deleteTicket",
			"contacts-page:deleteContact",
		],
	},

	admin1: {
		static: [
			"user-modal:editCompany",
		]
	}
};

export default rules;
