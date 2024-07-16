import * as Sentry from "@sentry/node";
import { Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";

import { Op } from "sequelize";
import formatBody from "../../helpers/Mustache";

interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
}: Request): Promise<WbotMessage> => {
  try {
    let quotedMsgSerializedId: string | undefined;

    if (quotedMsg) {
      let originalQuotedMsg: Message | null = null;
      console.log("--- quotedMsg: ", quotedMsg);

      if (quotedMsg.isDuplicated) {
        originalQuotedMsg = await Message.findOne({
          where: {
            body: quotedMsg.body,
            isDuplicated: {
              [Op.or]: [false, null]
            }
          }
        });

        if (!originalQuotedMsg) {
          throw new AppError("ERR_ORIGINAL_QUOTED_MSG_NOT_FOUND");
        }

        console.log("--- originalQuotedMsg: ", originalQuotedMsg);
      }

      const WbotMessageFound = await GetWbotMessage(
        ticket,
        quotedMsg.isDuplicated && originalQuotedMsg
          ? originalQuotedMsg.id
          : quotedMsg.id
      );

      quotedMsgSerializedId = WbotMessageFound.id._serialized;
    }

    const wbot = await GetTicketWbot(ticket);

    const bodyFormated = formatBody(body, ticket.contact);

    // console.log("--- sendWhatsAppMessage: ", bodyFormated);

    let mentionedNumbers: string[] | null = null;

    if (ticket.isGroup) {
      mentionedNumbers = bodyFormated
        .match(/@(\d+)/g)
        ?.map(match => match.slice(1));
      // console.log(bodyFormated.match(/@(\d+)/g)?.map(match => match.slice(1)));
    }

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
      bodyFormated,
      {
        quotedMessageId: quotedMsgSerializedId,
        linkPreview: false,
        ...(mentionedNumbers &&
          mentionedNumbers.length > 0 && {
            mentions: mentionedNumbers.map(number => number + "@c.us")
          })
      }
    );

    await ticket.update({ lastMessage: body });
    return sentMessage;
  } catch (err) {
    console.log("Error en SendWhatsAppMessage", err);
    Sentry.captureException(err);

    if (err && err?.message === "ERR_FETCH_WAPP_MSG") {
      throw new AppError("ERR_FETCH_WAPP_MSG");
    }

    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMessage;
