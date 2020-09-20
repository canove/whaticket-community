import { Request, Response } from "express";
import CreateMessageService from "../services/MessageServices/CreateMessageService";
import ListMessagesService from "../services/MessageServices/ListMessagesService";
// import Sequelize from "sequelize";
// import { MessageMedia } from "whatsapp-web.js";
// import Message from "../models/Message";
// import Contact from "../models/Contact";
// import User from "../models/User";
// import Whatsapp from "../models/Whatsapp";

// import Ticket from "../models/Ticket";
// import { getIO } from "../libs/socket";
// import { getWbot } from "../libs/wbot";

// const setMessagesAsRead = async ticket => {
//   const io = getIO();
//   const wbot = getWbot(ticket.whatsappId);

//   await Message.update(
//     { read: true },
//     {
//       where: {
//         ticketId: ticket.id,
//         read: false
//       }
//     }
//   );

//   try {
//     await wbot.sendSeen(`${ticket.contact.number}@c.us`);
//   } catch (err) {
//     console.log(
//       "Could not mark messages as read. Maybe whatsapp session disconnected?"
//     );
//   }

//   io.to("notification").emit("ticket", {
//     action: "updateUnread",
//     ticketId: ticket.id
//   });
// };

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { count, messages, ticket, hasMore } = await ListMessagesService({
    searchParam,
    pageNumber,
    ticketId
  });

  // const ticketMessages = await ticket.getMessages({
  //   where: whereCondition,
  //   limit,
  //   offset,
  //   order: [["createdAt", "DESC"]]
  // });

  // const count = await ticket.countMessages();

  // const serializedMessages = ticketMessages.map(message => {
  //   return {
  //     ...message.dataValues,
  //     mediaUrl: `${
  //       message.mediaUrl
  //         ? `${process.env.BACKEND_URL}:${process.env.PROXY_PORT}/public/${message.mediaUrl}`
  //         : ""
  //     }`
  //   };
  // });

  // const hasMore = count > offset + ticketMessages.length;

  // return res.json({
  //   messages: serializedMessages.reverse(),
  //   ticket,
  //   count,
  //   hasMore
  // });
  return res.json({ count, messages, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  // const io = getIO();

  const { ticketId } = req.params;
  const messageData = req.body;

  const message = await CreateMessageService({ messageData, ticketId });

  // const media = req.file;
  // let sentMessage;

  // const ticket = await Ticket.findByPk(ticketId, {
  //   include: [
  //     {
  //       model: Contact,
  //       as: "contact",
  //       attributes: ["number", "name", "profilePicUrl"]
  //     }
  //   ]
  // });

  // if (!ticket) {
  //   return res.status(404).json({ error: "No ticket found with this ID" });
  // }

  // if (!ticket.whatsappId) {
  //   const defaultWhatsapp = await Whatsapp.findOne({
  //     where: { default: true }
  //   });

  //   if (!defaultWhatsapp) {
  //     return res
  //       .status(404)
  //       .json({ error: "No default WhatsApp found. Check Connection page." });
  //   }

  //   await ticket.setWhatsapp(defaultWhatsapp);
  // }

  // const wbot = getWbot(ticket.whatsappId);

  // try {
  //   if (media) {
  //     const newMedia = MessageMedia.fromFilePath(req.file.path);

  //     message.mediaUrl = req.file.filename;
  //     if (newMedia.mimetype) {
  //       message.mediaType = newMedia.mimetype.split("/")[0];
  //     } else {
  //       message.mediaType = "other";
  //     }

  //     sentMessage = await wbot.sendMessage(
  //       `${ticket.contact.number}@c.us`,
  //       newMedia
  //     );

  //     await ticket.update({ lastMessage: message.mediaUrl });
  //   } else {
  //     sentMessage = await wbot.sendMessage(
  //       `${ticket.contact.number}@c.us`,
  //       message.body
  //     );
  //     await ticket.update({ lastMessage: message.body });
  //   }
  // } catch (err) {
  //   console.log(
  //     "Could not create whatsapp message. Is session details valid? "
  //   );
  // }

  // if (sentMessage) {
  //   message.id = sentMessage.id.id;
  // const newMessage = await ticket.createMessage(message);

  // const serialziedMessage = {
  //   ...newMessage.dataValues,
  //   mediaUrl: `${
  //     message.mediaUrl
  //       ? `${process.env.BACKEND_URL}:${process.env.PROXY_PORT}/public/${message.mediaUrl}`
  //       : ""
  //   }`
  // };

  // io.to(ticketId).to("notification").emit("appMessage", {
  //   action: "create",
  //   message: serialziedMessage,
  //   ticket,
  //   contact: ticket.contact
  // });

  // await setMessagesAsRead(ticket);

  return res.status(200).json(message);
};

//   return res
//     .status(500)
//     .json({ error: "Cannot sent whatsapp message. Check connection page." });
// };
