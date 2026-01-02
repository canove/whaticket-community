import { Request, Response } from "express";
import { logger } from "../utils/logger.js";
import { messageQueue } from "../libs/queue.js";
import Whatsapp from "../models/Whatsapp.js";

export const index = async (req: Request, res: Response): Promise<Response> => {
    const verificationRequest = req.query;
    if (verificationRequest["hub.mode"] === "subscribe" && verificationRequest["hub.verify_token"]) {
         // Verify logic
         return res.status(200).send(verificationRequest["hub.challenge"]);
    }
    return res.status(400).send("Error");
};

export const handleWebhook = async (req: Request, res: Response): Promise<Response> => {
    try {
        const body = req.body;
        // Normalize Meta Webhook
        if (body.object === "whatsapp_business_account") {
             for (const entry of body.entry) {
                 for (const change of entry.changes) {
                     if (change.value.messages) {
                         const message = change.value.messages[0];
                         const contact = change.value.contacts[0];
                         const metadata = change.value.metadata;

                         // Find Whatsapp based on phone number ID (metadata.phone_number_id)
                         // const whatsapp = await Whatsapp.findOne({ where: { qrcode: metadata.phone_number_id } });

                         // Push to Queue
                         // messageQueue.add("meta-message", { message, contact, metadata });
                     }
                 }
             }
        }
        return res.status(200).send("EVENT_RECEIVED");
    } catch (e) {
        logger.error(e);
        return res.status(500).send("Error");
    }
};
