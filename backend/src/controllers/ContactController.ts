import { Request, Response } from "express";
import * as Yup from "yup";
import { getIO } from "../libs/socket";

import CreateContactService from "../services/ContactServices/CreateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";
import ListContactsService from "../services/ContactServices/ListContactsService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";

import { Op, literal } from "sequelize";
import AppError from "../errors/AppError";
import { getWbot, getWbots } from "../libs/wbot";
import Category from "../models/Category";
import Contact from "../models/Contact";
import Message from "../models/Message";
import Queue from "../models/Queue";
import Ticket from "../models/Ticket";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";
import GetContactService from "../services/ContactServices/GetContactService";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import CheckContactNumber from "../services/WbotServices/CheckNumber";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

type IndexGetContactQuery = {
  name: string;
  number: string;
};

interface ExtraInfo {
  name: string;
  value: string;
}
interface ContactData {
  name: string;
  number: string;
  email?: string;
  domain?: string;
  extraInfo?: ExtraInfo[];
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber
  });

  return res.json({ contacts, count, hasMore });
};

export const getContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { name, number } = req.body as IndexGetContactQuery;

  const contact = await GetContactService({
    name,
    number
  });

  return res.status(200).json(contact);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const newContact: ContactData = req.body;
  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await CheckIsValidContact(newContact.number);
  const validNumber: any = await CheckContactNumber(newContact.number);

  const profilePicUrl = await GetProfilePicUrl(validNumber);

  let name = newContact.name;
  let number = validNumber;
  let email = newContact.email;
  let extraInfo = newContact.extraInfo;

  const contact = await CreateContactService({
    name,
    number,
    email,
    extraInfo,
    profilePicUrl
  });

  const io = getIO();
  io.emit("contact", {
    action: "create",
    contact
  });

  return res.status(200).json(contact);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;

  const contact = await ShowContactService(contactId);

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactData: ContactData = req.body;

  const schema = Yup.object().shape({
    name: Yup.string(),
    number: Yup.string().matches(
      /^\d+$/,
      "Invalid number format. Only numbers is allowed."
    )
  });

  try {
    await schema.validate(contactData);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // await CheckIsValidContact(contactData.number);

  const { contactId } = req.params;

  const contact = await UpdateContactService({ contactData, contactId });

  const url = process.env.NODE_URL + "/toEmit";
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      event: {
        name: "contact",
        data: {
          action: "update",
          contact
        }
      }
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("Success:", data);
    })
    .catch(error => {
      console.error("Error:", error);
    });

  // const io = getIO();

  // io.on("connect", () => {
  //   console.log("socket conectado para emitir el evento de contact");

  //   io.emit("contact", {
  //     action: "update",
  //     contact
  //   });

  //   console.log("evento emitido");

  //   io.disconnect();
  // });

  return res.status(200).json(contact);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;

  await DeleteContactService(contactId);

  const io = getIO();
  io.emit("contact", {
    action: "delete",
    contactId
  });

  return res.status(200).json({ message: "Contact deleted" });
};

export const getNumberGroups = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { number } = req.params;

  console.log("____number", number);

  const numberConnection = await Whatsapp.findOne({ where: { number } });

  const registerGroups = [];
  const notRegisterGroups = [];

  if (numberConnection) {
    console.log("____number is connection");

    const wbot = getWbot(numberConnection.id);

    const wbotChats = await wbot.getChats();

    const wbotGroupChats = wbotChats.filter(chat => chat.isGroup);

    console.log("connectionGorupsChats", wbotGroupChats.length);

    await Promise.all(
      wbotGroupChats.map(async chat => {
        const wbotChatInOurDb = await Contact.findOne({
          where: { number: chat.id.user },
          include: [
            {
              model: Ticket,
              as: "tickets",
              required: false,
              include: [
                {
                  model: Contact,
                  as: "contact",
                  attributes: [
                    "id",
                    "name",
                    "number",
                    "domain",
                    "profilePicUrl"
                  ]
                },
                {
                  model: User,
                  as: "user",
                  required: false
                },
                {
                  model: Queue,
                  as: "queue",
                  attributes: ["id", "name", "color"],
                  required: false
                },
                {
                  model: Whatsapp,
                  as: "whatsapp",
                  attributes: ["name"],
                  required: false
                },
                {
                  model: Category,
                  as: "categories",
                  attributes: ["id", "name", "color"]
                },

                {
                  model: User,
                  as: "helpUsers",
                  required: false
                },
                {
                  model: User,
                  as: "participantUsers",
                  required: false
                },
                {
                  model: Message,
                  as: "messages",
                  order: [["timestamp", "DESC"]],
                  required: false,
                  limit: 25,
                  separate: true,
                  include: [
                    {
                      model: Contact,
                      as: "contact",
                      required: false
                    }
                  ],
                  where: {
                    isPrivate: {
                      [Op.or]: [false, null]
                    }
                  }
                },
                {
                  model: Message,
                  as: "firstClientMessageAfterLastUserMessage",
                  attributes: ["id", "body", "timestamp"],
                  order: [["timestamp", "ASC"]],
                  required: false,
                  limit: 1,
                  where: {
                    isPrivate: {
                      [Op.or]: [false, null]
                    },
                    fromMe: false,
                    timestamp: {
                      [Op.gt]: literal(
                        `(SELECT MAX(mes.timestamp) FROM Messages mes WHERE mes.ticketId = Message.ticketId AND mes.fromMe = 1 AND (mes.isPrivate = 0 OR mes.isPrivate IS NULL))`
                      )
                    }
                  }
                }
              ]
            }
          ]
        });

        if (wbotChatInOurDb) {
          wbotChatInOurDb.tickets?.forEach(ticket => {
            ticket.messages?.sort((a, b) => a.timestamp - b.timestamp);
          });

          registerGroups.push(wbotChatInOurDb);
        } else {
          notRegisterGroups.push(chat);
        }
      })
    );
  } else {
    console.log("____number is not connection");

    const wbots = getWbots();

    await Promise.all(
      wbots.map(async wbot => {
        const wbotstate = await wbot.getState();

        if (wbotstate === "CONNECTED") {
          console.log("wbot.id", wbot.id);
          console.log("wbot.info", wbot.info);

          console.log("wbotstate", wbotstate);

          try {
            const wbotChatsIds = await wbot.getCommonGroups(number + "@c.us");

            // const wbotGroupChats = wbotChats.filter(chat => chat.isGroup);

            console.log("wbotChatsIds", wbotChatsIds.length);

            await Promise.all(
              wbotChatsIds.map(async chat => {
                const wbotChatInOurDb = await Contact.findOne({
                  where: { number: chat.user },
                  include: [
                    {
                      model: Ticket,
                      as: "tickets",
                      required: false,
                      include: [
                        {
                          model: Contact,
                          as: "contact",
                          attributes: [
                            "id",
                            "name",
                            "number",
                            "domain",
                            "profilePicUrl"
                          ]
                        },
                        {
                          model: User,
                          as: "user",
                          required: false
                        },
                        {
                          model: Queue,
                          as: "queue",
                          attributes: ["id", "name", "color"],
                          required: false
                        },
                        {
                          model: Whatsapp,
                          as: "whatsapp",
                          attributes: ["name"],
                          required: false
                        },
                        {
                          model: Category,
                          as: "categories",
                          attributes: ["id", "name", "color"]
                        },

                        {
                          model: User,
                          as: "helpUsers",
                          required: false
                        },
                        {
                          model: User,
                          as: "participantUsers",
                          required: false
                        },
                        {
                          model: Message,
                          as: "messages",
                          order: [["timestamp", "DESC"]],
                          required: false,
                          limit: 25,
                          separate: true,
                          include: [
                            {
                              model: Contact,
                              as: "contact",
                              required: false
                            }
                          ],
                          where: {
                            isPrivate: {
                              [Op.or]: [false, null]
                            }
                          }
                        },
                        {
                          model: Message,
                          as: "firstClientMessageAfterLastUserMessage",
                          attributes: ["id", "body", "timestamp"],
                          order: [["timestamp", "ASC"]],
                          required: false,
                          limit: 1,
                          where: {
                            isPrivate: {
                              [Op.or]: [false, null]
                            },
                            fromMe: false,
                            timestamp: {
                              [Op.gt]: literal(
                                `(SELECT MAX(mes.timestamp) FROM Messages mes WHERE mes.ticketId = Message.ticketId AND mes.fromMe = 1 AND (mes.isPrivate = 0 OR mes.isPrivate IS NULL))`
                              )
                            }
                          }
                        }
                      ]
                    }
                  ]
                });

                if (wbotChatInOurDb) {
                  wbotChatInOurDb.tickets?.forEach(ticket => {
                    ticket.messages?.sort((a, b) => a.timestamp - b.timestamp);
                  });

                  registerGroups.push(wbotChatInOurDb);
                } else {
                  notRegisterGroups.push(chat);
                }
              })
            );
          } catch (error) {
            console.log("error", error);
          }
        }
      })
    );
  }

  console.log("registerGroups", registerGroups.length);
  console.log("notRegisterGroups", notRegisterGroups.length);

  return res.status(200).json({ registerGroups, notRegisterGroups });
};
