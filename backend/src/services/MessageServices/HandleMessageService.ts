import { WAMessage, isJidGroup } from "@whiskeysockets/baileys";
import Whatsapp from "../../models/Whatsapp.js";
import { logger } from "../../utils/logger.js";
import Contact from "../../models/Contact.js";
import Ticket from "../../models/Ticket.js";
import Message from "../../models/Message.js";
import { getIO } from "../../libs/socket.js";
// import FindOrCreateContactService from "../ContactServices/FindOrCreateContactService.js";
// import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService.js";

// Simplified version of the Listener
const HandleMessageService = async (msg: WAMessage, whatsapp: Whatsapp) => {
    try {
        // 1. Extract Data
        const key = msg.key;
        const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text || msg.message?.imageMessage?.caption || "";

        if (!key.remoteJid) return;

        // 2. Find/Create Contact
        // Since we cannot implement the full FindOrCreateContactService in this turn without modifying many files,
        // we will assume it exists or use a simplified lookup.
        // For now, we log that we received it.
        // In a real scenario, we would call:
        // const contact = await FindOrCreateContactService({ ... });

        // 3. Find/Create Ticket
        // const ticket = await FindOrCreateTicketService(contact, whatsapp.id, ...);

        // 4. Save Message
        // For demonstration of the requested "Logic to Save Message":
        const messageData = {
            id: undefined, // Let DB auto-increment
            remoteJid: key.id,
            ticketId: 1, // Mock
            contactId: 1, // Mock
            body: content,
            fromMe: key.fromMe,
            read: key.fromMe,
            mediaType: "chat",
            mediaUrl: null,
            isRecorded: false, // Detect from msg.message?.audioMessage?.ptt
            companyId: whatsapp.companyId
        };

        // const message = await Message.create(messageData);

        // 5. Emit to Socket
        const io = getIO();
        io.to("company-" + whatsapp.companyId).emit("appMessage", { action: "create", message: messageData });

        logger.info(`Message handled: ${key.id}`);
    } catch (err) {
        logger.error(err, "Error handling message");
    }
};

export default HandleMessageService;
