import "../bootstrap";
import { Job } from "bullmq";
import { createWorker } from "../libs/queue";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import { logger } from "../utils/logger";

export interface OutboundMediaJobData {
  ticketId: number;
  mediaPath: string;
  mediaFilename: string;
  mediaMimetype: string;
  mediaBody?: string;
}

export const startOutboundWorker = () => {
  // concurrency=1 per queue — preserves send order and avoids rate-limit bursts
  const worker = createWorker<OutboundMediaJobData>(
    "outbound-messages",
    async (job: Job<OutboundMediaJobData>) => {
      const { ticketId, mediaPath, mediaFilename, mediaMimetype, mediaBody } =
        job.data;

      logger.debug({
        info: "Processing outbound media job",
        jobId: job.id,
        ticketId,
        mediaFilename
      });

      const ticket = await ShowTicketService(ticketId);

      const media = {
        path: mediaPath,
        filename: mediaFilename,
        mimetype: mediaMimetype,
        originalname: mediaFilename
      } as Express.Multer.File;

      const sentMedia = await SendWhatsAppMedia({
        media,
        ticket,
        body: mediaBody
      });

      await CreateMessageService({
        messageData: {
          id: sentMedia.id,
          ticketId: ticket.id,
          body: sentMedia.body || mediaFilename,
          fromMe: true,
          read: true,
          mediaType: sentMedia.type || "image",
          ack: sentMedia.ack || 1
        }
      });
    },
    1
  );

  logger.info({ info: "Outbound worker started" });
  return worker;
};
