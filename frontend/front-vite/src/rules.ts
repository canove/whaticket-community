import type { IRules } from "./types/Rules";
const rules = {
  user: {
    static: [],
    dynamic: [],
  },

  admin: {
    static: [
      "drawer-admin-items:view",
      "tickets-manager:showall",
      "user-modal:editProfile",
      "user-modal:editQueues",
      "ticket-options:deleteTicket",
      "ticket-options:transferWhatsapp",
    ],
    dynamic: {},
  },
} as IRules;

export default rules;
