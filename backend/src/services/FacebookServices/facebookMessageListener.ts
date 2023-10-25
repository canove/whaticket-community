import { writeFileSync } from "fs";
import axios from "axios";
import { join } from "path";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { getProfile, profilePsid, sendText } from "./graphAPI";
import Whatsapp from "../../models/Whatsapp";
import UpdateTicketService from "../TicketServices/UpdateTicketService";
import { debounce } from "../../helpers/Debounce";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import formatBody from "../../helpers/Mustache";
import Queue from "../../models/Queue";
import Message from "../../models/Message";
import FindOrCreateTicketServiceMeta from "../TicketServices/FindOrCreateTicketServiceMeta";
import { isNumeric, sleep, validaCpfCnpj, verifyRating } from "../WbotServices/wbotMessageListener";
import moment from "moment";
import UserRating from "../../models/UserRating";
import { isNil, isNull, head } from "lodash";
import TicketTraking from "../../models/TicketTraking";
import { getIO } from "../../libs/socket";
import FindOrCreateATicketTrakingService from "../TicketServices/FindOrCreateATicketTrakingService";
import puppeteer from "puppeteer";
import Setting from "../../models/Setting";

import { sendFacebookMessageFileExternal, sendFacebookMessageMediaExternal } from "../FacebookServices/sendFacebookMessageMedia";
import sendFaceMessage from "../FacebookServices/sendFacebookMessage";

import fs from "fs";
import QueueOption from "../../models/QueueOption";

interface IMe {
  name: string;
  // eslint-disable-next-line camelcase
  first_name: string;
  // eslint-disable-next-line camelcase
  last_name: string;
  // eslint-disable-next-line camelcase
  profile_pic: string;
  id: string;
}

export interface Entry {
  id: string;
  time: number;
  messaging: Messaging[];
}

export interface Root {
  object: string;
  entry: Entry[];
}

export interface Sender {
  id: string;
}

export interface Recipient {
  id: string;
}

export interface MessageX {
  mid: string;
  text: string;
  reply_to: ReplyTo;
}

export interface Messaging {
  sender: Sender;
  recipient: Recipient;
  timestamp: number;
  message: MessageX;
}
export interface ReplyTo {
  mid: string;
}

const verifyContact = async (msgContact: any, companyId: number, channel = "whatsapp") => {
  if (!msgContact) return null;

  const contactData = {
    name:
      msgContact?.name || `${msgContact?.first_name} ${msgContact?.last_name}`,
    number: msgContact.id,
    profilePicUrl: "",
    isGroup: false,
    companyId,
    channel
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (msg: any): Promise<Message | null> => {
  if (!msg) return null;
  const quoted = msg?.reply_to?.mid;

  if (!quoted) return null;

  const quotedMsg = await Message.findOne({
    where: { id: quoted }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

export const verifyMessage = async (
  msg: any,
  body: any,
  ticket: Ticket,
  contact: Contact,
  companyId: number,
  channel: string,
) => {
  const quotedMsg = await verifyQuotedMessage(msg);
  const messageData = {
    id: msg.mid || msg.message_id,
    ticketId: ticket.id,
    contactId: msg.is_echo ? undefined : contact.id,
    body: msg.text || body,
    fromMe: msg.is_echo,
    read: msg?.is_echo,
    quotedMsgId: quotedMsg?.id,
    ack: 3,
    dataJson: JSON.stringify(msg),
    channel: channel
  };

  await CreateMessageService({ messageData, companyId });

  await ticket.update({
    lastMessage: msg.text
  });
};

export const verifyMessageMedia = async (
  msg: any,
  ticket: Ticket,
  contact: Contact,
  companyId: number,
  channel: string,
): Promise<void> => {
  const { data } = await axios.get(msg.attachments[0].payload.url, {
    responseType: "arraybuffer"
  });

  // eslint-disable-next-line no-eval
  const { fileTypeFromBuffer } = await (eval('import("file-type")') as Promise<
    typeof import("file-type")
  >);

  const type = await fileTypeFromBuffer(data);

  const fileName = `${new Date().getTime()}.${type.ext}`;

  writeFileSync(
    join(__dirname, "..", "..", "..", "public", fileName),
    data,
    "base64"
  );

  const messageData = {
    id: msg.mid,
    ticketId: ticket.id,
    contactId: msg.is_echo ? undefined : contact.id,
    body: msg?.text || fileName,
    fromMe: msg.is_echo,
    mediaType: msg.attachments[0].type,
    mediaUrl: fileName,
    read: msg.is_echo,
    quotedMsgId: null,
    ack: 3,
    dataJson: JSON.stringify(msg),
    channel: channel
  };

  await CreateMessageService({ messageData, companyId: companyId });

  await ticket.update({
    lastMessage: msg?.text || fileName,
  });
};



const sendMessageImage = async (
  contact,
  ticket: Ticket,
  url: string,
  caption: string
) => {

  let sentMessage
  try {

    sentMessage = await sendFacebookMessageMediaExternal({
      url,
      ticket,
    })

  } catch (error) {
    await sendFaceMessage({
      ticket,
      body: formatBody('Não consegui enviar o PDF, tente novamente!', contact)
    })
  }
  // verifyMessage(sentMessage, ticket, contact);
};

const verifyQueue = async (
  wbot: any,
  message: string,
  ticket: Ticket,
  contact: Contact
) => {
  const { queues, greetingMessage } = await ShowWhatsAppService(
    wbot.id!,
    ticket.companyId
  );
  if (queues?.length === 1) {
    const firstQueue = head(queues);
    let chatbot = false;
    if (firstQueue?.options) {
      chatbot = firstQueue?.options?.length > 0;
    }
    await UpdateTicketService({
      ticketData: { queueId: firstQueue?.id, chatbot },
      ticketId: ticket.id,
      companyId: ticket.companyId,
    });

    return;
  }

  const selectedOption = message;
  const choosenQueue = queues[+selectedOption - 1];

  const companyId = ticket.companyId;

  const botText = async () => {
    let options = "";

    queues.forEach((queue, index) => {
      options += `*[ ${index + 1} ]* - ${queue.name}\n`;
    });


    const textMessage = formatBody(`\u200e${greetingMessage}\n\n${options}`, contact)

    await sendFaceMessage({
      ticket,
      body: textMessage
    })

    // const sendMsg = await wbot.sendMessage(
    //   `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
    //   textMessage
    // );

    // await verifyMessage(sendMsg, ticket, ticket.contact);
  };

  if (choosenQueue) {
    let chatbot = false;
    if (choosenQueue?.options) {
      chatbot = choosenQueue?.options?.length > 0;
    }
    await UpdateTicketService({
      ticketData: { queueId: choosenQueue.id, chatbot },
      ticketId: ticket.id,
      companyId: ticket.companyId,
    });


    /* Tratamento para envio de mensagem quando a fila está fora do expediente */
    if (choosenQueue?.options?.length === 0) {
      const queue = await Queue.findByPk(choosenQueue.id);
      const { schedules }: any = queue;
      const now = moment();
      const weekday = now.format("dddd").toLowerCase();
      let schedule;
      if (Array.isArray(schedules) && schedules?.length > 0) {
        schedule = schedules.find((s) => s.weekdayEn === weekday && s.startTime !== "" && s.startTime !== null && s.endTime !== "" && s.endTime !== null);
      }

      if (queue.outOfHoursMessage !== null && queue.outOfHoursMessage !== "" && !isNil(schedule)) {
        const startTime = moment(schedule.startTime, "HH:mm");
        const endTime = moment(schedule.endTime, "HH:mm");

        if (now.isBefore(startTime) || now.isAfter(endTime)) {
          const body = formatBody(`${queue.outOfHoursMessage}\n\n*[ # ]* - Voltar ao Menu Principal`, ticket.contact);

          const sentMessage = await sendFaceMessage({
            ticket,
            body: body
          })

          // const sentMessage = await wbot.sendMessage(
          //   `${contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
          //   text: body,
          // }
          // );
          // await verifyMessage(sentMessage, ticket, contact);
          await UpdateTicketService({
            ticketData: { queueId: null, chatbot },
            ticketId: ticket.id,
            companyId: ticket.companyId,
          });
          return;
        }
      }

      const body = formatBody(`\u200e${choosenQueue.greetingMessage}`, ticket.contact
      );
      const sentMessage = await sendFaceMessage({
        ticket,
        body: body
      })
      // await verifyMessage(sentMessage, ticket, contact);
    }

  } else {
    await botText();

  }

};

const handleChartbot = async (ticket: Ticket, msg: string, wbot: any, dontReadTheFirstQuestion: boolean = false) => {

  const queue = await Queue.findByPk(ticket.queueId, {
    include: [
      {
        model: QueueOption,
        as: "options",
        where: { parentId: null },
        order: [
          ["option", "ASC"],
          ["createdAt", "ASC"],
        ],
      },
    ],
  });
  if (ticket.queue !== null) {
    const queue = await Queue.findByPk(ticket.queueId);
    const { schedules }: any = queue;
    const now = moment();
    const weekday = now.format("dddd").toLowerCase();
    let schedule;

    if (Array.isArray(schedules) && schedules?.length > 0) {
      schedule = schedules.find((s) => s.weekdayEn === weekday && s.startTime !== "" && s.startTime !== null && s.endTime !== "" && s.endTime !== null);
    }

    if (ticket.queue.outOfHoursMessage !== null && ticket.queue.outOfHoursMessage !== "" && !isNil(schedule)) {

      const startTime = moment(schedule.startTime, "HH:mm");
      const endTime = moment(schedule.endTime, "HH:mm");

      if (now.isBefore(startTime) || now.isAfter(endTime)) {
        const body = formatBody(`${ticket.queue.outOfHoursMessage}\n\n*[ # ]* - Voltar ao Menu Principal`, ticket.contact);



        await sendFaceMessage({
          ticket,
          body: body
        })
        // await verifyMessage(sentMessage, ticket, ticket.contact);
        return;
      }


      const body = formatBody(`\u200e${ticket.queue.greetingMessage}`, ticket.contact
      );
      // const sentMessage = await wbot.sendMessage(
      //   `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`, {
      //   text: body,
      // }
      // );

      await sendFaceMessage({
        ticket,
        body: body
      })
      // await verifyMessage(sentMessage, ticket, ticket.contact);
    }
  }


  const messageBody = msg

  if (messageBody == "#") {
    // voltar para o menu inicial
    await ticket.update({ queueOptionId: null, chatbot: false, queueId: null });
    await verifyQueue(wbot, msg, ticket, ticket.contact);
    return;
  }

  // voltar para o menu anterior
  if (!isNil(queue) && !isNil(ticket.queueOptionId) && messageBody == "#") {
    const option = await QueueOption.findByPk(ticket.queueOptionId);
    await ticket.update({ queueOptionId: option?.parentId });

    // escolheu uma opção
  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    const count = await QueueOption.count({
      where: { parentId: ticket.queueOptionId },
    });
    let option: any = {};
    if (count == 1) {
      option = await QueueOption.findOne({
        where: { parentId: ticket.queueOptionId },
      });
    } else {
      option = await QueueOption.findOne({
        where: {
          option: messageBody || "",
          parentId: ticket.queueOptionId,
        },
      });
    }
    if (option) {
      await ticket.update({ queueOptionId: option?.id });
    }

    // não linha a primeira pergunta
  } else if (!isNil(queue) && isNil(ticket.queueOptionId) && !dontReadTheFirstQuestion) {
    const option = queue?.options.find((o) => o.option == messageBody);
    if (option) {
      await ticket.update({ queueOptionId: option?.id });
    }
  }

  await ticket.reload();

  if (!isNil(queue) && isNil(ticket.queueOptionId)) {

    const queueOptions = await QueueOption.findAll({
      where: { queueId: ticket.queueId, parentId: null },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    const companyId = ticket.companyId;


    const botText = async () => {
      let options = "";

      queueOptions.forEach((option, i) => {
        options += `*[ ${option.option} ]* - ${option.title}\n`;
      });
      options += `\n*[ # ]* - Voltar Menu Inicial`;

      const textMessage = formatBody(`\u200e${queue.greetingMessage}\n\n${options}`, ticket.contact)

      // const sendMsg = await wbot.sendMessage(
      //   `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      //   textMessage
      // );

      await sendFaceMessage({
        ticket,
        body: textMessage
      })

      // await verifyMessage(sendMsg, ticket, ticket.contact);
    };
    return botText();

  } else if (!isNil(queue) && !isNil(ticket.queueOptionId)) {
    const currentOption = await QueueOption.findByPk(ticket.queueOptionId);
    const queueOptions = await QueueOption.findAll({
      where: { parentId: ticket.queueOptionId },
      order: [
        ["option", "ASC"],
        ["createdAt", "ASC"],
      ],
    });

    if (queueOptions?.length > 1) {


      const botText = async () => {

        let options = "";

        queueOptions.forEach((option, i) => {
          options += `*[ ${option.option} ]* - ${option.title}\n`;
        });
        options += `\n*[ # ]* - Voltar Menu Inicial`;


        await sendFaceMessage({
          ticket,
          body: formatBody(`\u200e${currentOption.message}\n\n${options}`, ticket.contact)
        })

      };

      return botText();

    }
  }
}

const sendMessageLink = async (
  ticket: Ticket,
  url: string,
) => {
  await sendFacebookMessageFileExternal({
    url,
    ticket,
  })
  // verifyMessage(sentMessage, ticket, contact);
};

export const handleMessage = async (
  token: Whatsapp,
  webhookEvent: any,
  channel: string,
  companyId: number
): Promise<any> => {



  if (webhookEvent.message) {
    let msgContact: any;

    const senderPsid = webhookEvent.sender.id;
    const recipientPsid = webhookEvent.recipient.id;
    const { message } = webhookEvent;
    const fromMe = message.is_echo;


    if (fromMe) {
      // if (/\u200e/.test(message.text)) return;
      msgContact = await profilePsid(recipientPsid, token.facebookUserToken);
    } else {
      msgContact = await profilePsid(senderPsid, token.facebookUserToken);
    }

    const contact = await verifyContact(msgContact, companyId, channel);

    const unreadCount = fromMe ? 0 : 1;

    const getSession = await Whatsapp.findOne({
      where: {
        facebookPageUserId: token.facebookPageUserId
      },
      include: [
        {
          model: Queue,
          as: "queues",
          attributes: ["id", "name", "color", "greetingMessage"],
          include: [{ model: QueueOption, as: "options" }]
        }
      ],
      order: [
        ["queues", "id", "ASC"],
      ]
    });


    if (fromMe && getSession.complationMessage && formatBody(getSession.complationMessage, contact) === `${message.text}`) {

      return;
    }



    const ticket = await FindOrCreateTicketServiceMeta(
      contact,
      getSession.id,
      unreadCount,
      companyId,
      channel
    )

    if (message.attachments) {
      await verifyMessageMedia(message, ticket, contact, companyId, channel);
    }

    await verifyMessage(message, message.text, ticket, contact, companyId, channel);



    if (message == "#") {
      await ticket.update({
        queueOptionId: null,
        chatbot: false,
        queueId: null,
      });
      return;
    }


    const ticketTraking = await FindOrCreateATicketTrakingService({
      ticketId: ticket.id,
      companyId,
      whatsappId: getSession?.id,
      channel,
    });

    try {
      if (!fromMe) {
        if (ticketTraking !== null && verifyRating(ticketTraking)) {
          handleRating(message, ticket, ticketTraking);
          return;
        }
      }
    } catch (e) {
      console.log(e);
    }

    if (!ticket.queue && !fromMe && !ticket.userId && getSession?.queues?.length >= 1) {
      await verifyQueue(getSession, message, ticket, ticket.contact);
    }

    const dontReadTheFirstQuestion = ticket.queue === null;

    await ticket.reload();

    if (getSession?.queues?.length == 1 && ticket.queue) {
      if (ticket.chatbot && !fromMe) {
        await handleChartbot(ticket, message, getSession);
      }
    }

    if (getSession?.queues?.length > 1 && ticket.queue) {
      if (ticket.chatbot && !fromMe) {
        await handleChartbot(ticket, message, getSession, dontReadTheFirstQuestion);
      }
    }

  }

};


export const handleRating = async (
  msg: any,
  ticket: Ticket,
  ticketTraking: TicketTraking
) => {
  const io = getIO();
  let rate: number | null = null;

  if (msg.text) {
    rate = +msg.text || null;
  }

  if (!Number.isNaN(rate) && Number.isInteger(rate) && !isNull(rate)) {
    const { complationMessage } = await ShowWhatsAppService(
      ticket.whatsappId,
      ticket.companyId
    );


    let finalRate = rate;

    if (rate < 1) {
      finalRate = 1;
    }
    if (rate > 3) {
      finalRate = 3;
    }

    await UserRating.create({
      ticketId: ticketTraking.ticketId,
      companyId: ticketTraking.companyId,
      userId: ticketTraking.userId,
      rate: finalRate,
    });
    const body = formatBody(`\u200e${complationMessage}`, ticket.contact);

    await sendFaceMessage({
      ticket,
      body: body
    })

    await ticketTraking.update({
      finishedAt: moment().toDate(),
      rated: true,
    });



    setTimeout(async () => {
      await ticket.update({
        queueId: null,
        chatbot: null,
        queueOptionId: null,
        userId: null,
        status: "closed",
      });

      io.to("open").emit(`company-${ticket.companyId}-ticket`, {
        action: "delete",
        ticket,
        ticketId: ticket.id,
      });

      io.to(ticket.status)
        .to(ticket.id.toString())
        .emit(`company-${ticket.companyId}-ticket`, {
          action: "update",
          ticket,
          ticketId: ticket.id,
        });

    }, 2000)

  }

};
