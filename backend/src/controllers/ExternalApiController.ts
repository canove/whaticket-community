import ExcelJS from "exceljs";
import { Request, Response } from "express";
import WAWebJS, { MessageMedia, MessageSendOptions } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import formatBody from "../helpers/Mustache";
import { getWbot } from "../libs/wbot";
import Category from "../models/Category";
import Log from "../models/Log";
import MarketingCampaign from "../models/MarketingCampaign";
import MarketingCampaignAutomaticMessage from "../models/MarketingCampaignAutomaticMessage";
import MessagingCampaign from "../models/MessagingCampaign";
import MessagingCampaignShipment from "../models/MessagingCampaignShipment";
import MessagingCampaignShipmentNumber from "../models/MessagingCampaignShipmentNumber";
import User from "../models/User";
import Whatsapp from "../models/Whatsapp";
import { getCountryIdOfNumber } from "../services/ContactServices/CreateOrUpdateContactService";
import SearchLogTypeService from "../services/LogServices/SearchLogTypeService";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import SendApiChatbotMessage from "../services/WbotServices/SendApiChatbotMessage";
import SendExternalWhatsAppImageMessage from "../services/WbotServices/SendExternalWhatsAppImageMessage";
import SendExternalWhatsAppMessage from "../services/WbotServices/SendExternalWhatsAppMessage";
import SendExternalWhatsAppMessageAddon from "../services/WbotServices/SendExternalWhatsAppMessageAddon";
import FindGroupByNameService from "../services/WbotServices/FindGroupByNameService";
import SendMessageToTicketService from "../services/WbotServices/SendMessageToTicketService";
import SendMessageToContactService from "../services/WbotServices/SendMessageToContactService";
import FixGroupNamesService from "../services/ContactServices/FixGroupNamesService";
import {
  verifyContact,
  verifyMessage
} from "../services/WbotServices/wbotMessageListener";
import getUnixTimestamp from "../utils/getUnixTimestamp";
import sleepPromise from "../utils/sleepPromise";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import { emitEvent } from "../libs/emitEvent";
import ContactClientelicencia from "../models/ContactClientelicencias";
import { Op } from "sequelize";
import dayjs from "dayjs";
import Message from "../models/Message";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import Country from "../models/Country";
import WhatsappCountry from "../models/WhatsappCountry";
import Queue from "../models/Queue";
import SendMessageRequest from "../models/SendMessageRequest";
import { addMessageToQueue } from "../services/WbotServices/SendExternalWhatsAppMessageV2";

dayjs.extend(utc);
dayjs.extend(timezone);

export const sendApiChatbotMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log("--- CALL FOR sendApiChatbotMessage", req.body);

  const {
    botNumber,
    toNumbers,
    messageVariables,
    chatbotMessageIdentifier,
    localbi_id
  } = req.body;

  const result = await SendApiChatbotMessage({
    botNumber,
    toNumbers,
    messageVariables,
    chatbotMessageIdentifier,
    localbi_id
  });

  if (!result.ok) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
};

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fromNumber, toNumber, message } = req.body;

  const sendExternalWhatsAppMessage = await SendExternalWhatsAppMessage({
    fromNumber,
    toNumber,
    message,
    createRegisterInDb: true
  });

  return res.status(200).json(sendExternalWhatsAppMessage);
};

export const sendMessageV2 = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    fromNumber,
    toNumber,
    message,
    mediaUrl,
    channel,
    localId,
    recipientName,
    notificationType,
    surveyName,
    classification,
    clientName,
    clientPhone
  } = req.body;

  const sendExternalWhatsAppMessage = await addMessageToQueue({
    fromNumber,
    toNumber,
    message,
    mediaUrl,
    channel,
    localId,
    recipientName,
    notificationType,
    surveyName,
    classification,
    clientName,
    clientPhone
  });

  // El cliente PHP (Utility::peticionPublica) da la peticion por fallida cuando la respuesta
  // no trae "tipo", aunque el mensaje si se haya encolado. Se responde con el mismo contrato
  // que el resto de endpoints externos: "1" ok, "3" error.
  return res.status(200).json({
    ...sendExternalWhatsAppMessage,
    tipo: sendExternalWhatsAppMessage.mensajes.length ? "3" : "1"
  });
};

export const sendMessageAddon = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { toNumber, message, mediaUrl } = req.body;

  const sendExternalWhatsAppMessage = await SendExternalWhatsAppMessageAddon({
    toNumber,
    message,
    mediaUrl
  });

  return res.status(200).json(sendExternalWhatsAppMessage);
};

export const sendMakeMessaginCampaign = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log("--- CALL FOR sendMakeMessaginCampaign", req.body);

  const { desdeNumero, data } = req.body;

  if (!desdeNumero) {
    throw new AppError(
      "No mandaste el número de Whatsapp desde donde se van a enviar los mensajes",
      404
    );
  }

  const whatsapp = await Whatsapp.findOne({
    where: {
      number: desdeNumero
    }
  });

  if (!whatsapp) {
    throw new AppError("Whatsapp no encontrado", 404);
  }

  if (!data) {
    throw new AppError(
      "No mandaste data, recuerda de que debes de mandar un array de objectos",
      404
    );
  }

  const messagingCampaign = await MessagingCampaign.findOne({
    where: {
      name: "MAKE"
    },
    include: [
      {
        model: MessagingCampaignShipment,
        as: "messagingCampaignShipments",
        order: [["id", "DESC"]],
        required: false,
        separate: true
      }
    ]
  });

  if (!messagingCampaign) {
    throw new AppError("Campaña de mensajes MAKE no encontrada", 404);
  }

  if (messagingCampaign.messagingCampaignShipments[0]?.status === "sending") {
    throw new AppError("Hay un envío de campaña de mensajes en curso", 500);
  }

  await messagingCampaign.update({
    timesSent: messagingCampaign.timesSent + 1
  });

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("data");

  // Agregar encabezados
  worksheet.columns = [
    { header: "Número", key: "number", width: 50 },
    { header: "Mensaje", key: "message", width: 100 }
  ];

  data.forEach(item => {
    worksheet.addRow({ number: item.number, message: item.message });
  });

  const excelName = `${messagingCampaign.name}-${Date.now()}.xlsx`;

  await workbook.xlsx.writeFile("public/" + excelName);

  console.log("Excel creado");
  console.log("messagingCampaign", messagingCampaign);
  console.log("messagingCampaign id", messagingCampaign.id);

  const newMessagingCampaignShipment = await MessagingCampaignShipment.create({
    messagingCampaignId: messagingCampaign.id,
    startTimestamp: (Date.now() / 1000) | 0,
    whatsappId: whatsapp.id,
    excelUrl: excelName
  });

  await messagingCampaign.reload();

  let shipmentCanceled = false;
  let numbersWithErrors = [];

  console.log("newMessagingCampaignShipment", newMessagingCampaignShipment);

  for (const numberObj of data) {
    const { number, message } = numberObj;

    let numberFailed = false;

    try {
      // verify if the shipment was canceled
      const shipment = await MessagingCampaignShipment.findByPk(
        newMessagingCampaignShipment.id
      );

      if (shipment.status === "canceled") {
        shipmentCanceled = true;
        break;
      }

      await CheckIsValidContact(number, whatsapp.id);

      const wbot = getWbot(whatsapp.id);

      const sentMessages: WAWebJS.Message[] = [];

      let msg: WAWebJS.Message;

      let body = formatBody(`\u200e${message}`);

      await new Promise(async (resolve, reject) => {
        try {
          const msg = await wbot.sendMessage(`${number}@c.us`, body);

          sentMessages.push(msg);

          const msgContact = await wbot.getContactById(msg.to);
          const contact = await verifyContact(msgContact);

          const ticket = await FindOrCreateTicketService({
            contact,
            whatsappId: whatsapp.id,
            unreadMessages: 0,
            groupContact: null,
            lastMessageTimestamp: msg.timestamp,
            messagingCampaignId: messagingCampaign.id,
            messagingCampaignShipmentId: newMessagingCampaignShipment.id,
            msgFromMe: msg.fromMe
          });

          await verifyMessage({
            msg,
            ticket,
            contact
          });

          setTimeout(() => {
            resolve(null);
          }, 1500);
        } catch (error) {
          reject(error);
        }
      }).catch(error => {
        numberFailed = true;
        numbersWithErrors.push({
          number,
          error: error.message
        });
      });
    } catch (error) {
      numberFailed = true;
      numbersWithErrors.push({
        number,
        error: error.message
      });
    }

    await MessagingCampaignShipmentNumber.create({
      number: numberObj.number,
      hadError: numberFailed,
      messagingCampaignShipmentId: newMessagingCampaignShipment.id
    });
  }

  await newMessagingCampaignShipment.update({
    endTimestamp: (Date.now() / 1000) | 0,
    status: shipmentCanceled ? undefined : "sent"
  });

  return res.status(200).json({
    message: "Campaña de mensajes MAKE enviada",
    numbersWithErrors
  });
};

export const sendMarketingCampaignIntro = async (
  req: Request,
  res: Response
): Promise<Response> => {
  req.myLog(
    "--- CALL FOR sendMarketingCampaignIntro" + JSON.stringify(req.body)
  );

  let {
    contacto_numero,
    contact_nombre,
    contact_correo,
    contact_nombre_negocio,
    user_id,
    campaign_id,
    whatsapp_number
  } = req.body;

  if (
    !contacto_numero ||
    !contact_nombre ||
    !contact_correo ||
    !contact_nombre_negocio ||
    !user_id ||
    !campaign_id
  ) {
    throw new AppError("Faltan datos");
  }

  contacto_numero = contacto_numero.replace(/\D/g, "");
  req.myLog(`Número limpio: ${contacto_numero}`);

  const countryId = await getCountryIdOfNumber(contacto_numero);
  req.myLog(`Country ID detectado: ${countryId}`);

  let whatsapp = null;

  if (whatsapp_number) {
    // Normalizar el número de WhatsApp (eliminar + y otros caracteres)
    const normalizedWhatsappNumber = whatsapp_number.replace(/\D/g, "");
    req.myLog(`Buscando WhatsApp por número: ${whatsapp_number} (normalizado: ${normalizedWhatsappNumber})`);
    whatsapp = await Whatsapp.findOne({
      where: {
        number: normalizedWhatsappNumber
      }
    });
    if (whatsapp) {
      req.myLog(`WhatsApp encontrado por número: ID ${whatsapp.id}, Nombre: ${whatsapp.name}`);
    } else {
      req.myLog(`No se encontró WhatsApp con número: ${whatsapp_number}`);
    }
  }

  if (!whatsapp) {
    req.myLog(`Buscando WhatsApp por país (countryId: ${countryId})`);
    whatsapp = await Whatsapp.findOne({
      include: [
        {
          model: WhatsappCountry,
          as: "whatsappCountries",
          where: {
            countryId
          },
          required: true
        }
      ]
    });

    if (whatsapp) {
      req.myLog(`WhatsApp encontrado por país: ID ${whatsapp.id}, Nombre: ${whatsapp.name}`);
    } else {
      req.myLog(`No se encontró WhatsApp para countryId: ${countryId}`);
    }

    if (!whatsapp) {
      req.myLog(`Usando WhatsApp por defecto (isDefault: true)`);
      whatsapp = await Whatsapp.findOne({
        where: {
          isDefault: true
        }
      });
      if (!whatsapp) {
        throw new AppError(
          "No se encontró un Whatsapp para el pais de este lead ni uno por defecto",
          400
        );
      } else {
        req.myLog(`WhatsApp por defecto encontrado: ID ${whatsapp.id}, Nombre: ${whatsapp.name}`);
      }
    }
  }

  req.myLog("validando el contacto con el wpp id " + whatsapp.id);
  await CheckIsValidContact(contacto_numero, whatsapp.id);

  const wbot = getWbot(whatsapp.id);

  const marketingCampaign = await MarketingCampaign.findByPk(campaign_id, {
    include: [
      {
        model: MarketingCampaignAutomaticMessage,
        as: "marketingCampaignAutomaticMessages",
        required: false,
        order: [["order", "ASC"]],
        separate: true
      }
    ]
  });

  if (!marketingCampaign) {
    throw new AppError("Campaña de marketing no encontrada", 404);
  }

  if (!marketingCampaign.isActive) {
    throw new AppError("Campaña de marketing no activa", 400);
  }

  const messagesToSend = marketingCampaign.marketingCampaignAutomaticMessages;

  if (messagesToSend.length === 0) {
    throw new AppError("No hay mensajes para enviar", 400);
  }

  const logType = await SearchLogTypeService("send-marketingCampaign-intro");

  const log = await Log.create({
    logTypeId: logType.id,
    startTimestamp: getUnixTimestamp(),
    incomingEndpoint: req.originalUrl,
    incomingData: JSON.stringify(req.body)
  });

  let ticket = null;
  let contact = null;
  let wasOk = true;
  let errorArr = [];

  const defaultCategory = await Category.findOne({
    where: { isDefault: true }
  });

  req.myLog("enviando mensajes");
  for (const messageToSend of messagesToSend) {
    if (messageToSend.mediaType === "text") {
      try {
        req.myLog("mensaje de texto");
        let body = formatBody(`\u200e${messageToSend.body}`);

        const msg = await wbot.sendMessage(`${contacto_numero}@c.us`, body);

        const msgContact = await wbot.getContactById(msg.to);

        contact = await verifyContact(msgContact);

        const userExists = await User.findByPk(user_id);

        req.myLog("userExists: " + userExists);

        ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: whatsapp.id,
          unreadMessages: 0,
          groupContact: null,
          lastMessageTimestamp: msg.timestamp,
          marketingCampaignId: marketingCampaign.id,
          msgFromMe: msg.fromMe,
          userId: userExists ? user_id : undefined,
          categoriesIds:
            userExists && defaultCategory ? [defaultCategory.id] : undefined
        });

        await verifyMessage({
          msg,
          ticket,
          contact
        });

        await sleepPromise(1500);
      } catch (error) {
        console.log({ error });
        wasOk = false;
        errorArr.push(error);
      }
    } else {
      try {
        req.myLog("mensaje multimedia");
        const newMedia = MessageMedia.fromFilePath(
          `public/${messageToSend.mediaUrl.split("/").pop()}`
        );

        let mediaOptions: MessageSendOptions = {
          sendAudioAsVoice: true
        };

        if (
          newMedia.mimetype.startsWith("image/") &&
          !/^.*\.(jpe?g|png|gif)?$/i.exec(messageToSend.mediaUrl)
        ) {
          mediaOptions["sendMediaAsDocument"] = true;
        }

        const msg = await wbot.sendMessage(
          `${contacto_numero}@c.us`,
          newMedia,
          mediaOptions
        );

        await sleepPromise(1500);
      } catch (error) {
        console.log({ error });
        wasOk = false;
        errorArr.push(error);
      }
    }
  }

  await log.update({
    endTimestamp: getUnixTimestamp(),
    contactId: contact?.id,
    ticketId: ticket?.id,
    whatsappId: whatsapp?.id,
    userId: user_id,
    marketingCampaignId: marketingCampaign.id,
    wasOk,
    error: JSON.stringify(errorArr)
  });

  return res.status(200).json({ data: log, reqLogs: req.myLog });
};

export const sendImageMessage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fromNumber, toNumber, imageUrl, caption } = req.body;

  const newMessage = await SendExternalWhatsAppImageMessage({
    fromNumber,
    toNumber,
    imageUrl,
    caption
  });

  return res.status(200).json(newMessage);
};

export const updateFromTrazaByClientelicenciaId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { clientelicenciaId, etapacl_id } = req.body;

  if (!clientelicenciaId || !etapacl_id) {
    throw new AppError("Faltan datos: clientelicenciaId o etapacl_id");
  }

  const contacts = await Contact.findAll({
    include: [
      {
        model: ContactClientelicencia,
        as: "contactClientelicencias",
        where: {
          traza_clientelicencia_id: clientelicenciaId
        },
        required: true
      }
    ],
  });

  if (!contacts || contacts.length === 0) {
    throw new AppError("No se encontró un contacto con el clientelicenciaId proporcionado", 404);
  }

  for (const contact of contacts) {
    // Detectar si el contacto está cambiando a etapa ALTA (5)
    const isChangingToAlta = 
      etapacl_id === 5 && 
      contact.traza_clientelicencia_currentetapaid !== 5;

    await contact.update({
      traza_clientelicencia_currentetapaid: etapacl_id
    });

    // Si el contacto cambió a etapa ALTA, actualizar todos sus tickets abiertos/pendientes de grupo
    if (isChangingToAlta) {
      await Ticket.update(
        { etapa_alta_assigned_at: new Date() },
        {
          where: {
            contactId: contact.id,
            status: { [Op.in]: ["pending", "open"] },
            isGroup: true
          }
        }
      );
    }

    const ticketsToUpdate = await Ticket.findAll({
      where: {
        contactId: contact.id,
      }
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const ticket of ticketsToUpdate) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const ticketWithAllData = await ShowTicketService(ticket.id, true);

        emitEvent({
          to: [ticket.status],
          event: {
            name: "ticket",
            data: {
              action: "update",
              ticket: ticketWithAllData
            }
          }
        });
      } catch (error) {
        console.error(
          `Error emitting updated ticket ${ticket.id} from Traza update`,
          error
        );
      }
    }
  }

  return res.status(200).json({
    tipo: 1,
    mensajes: ["Whaticket - Contacto actualizado correctamente"],
    data: contacts
  });
};

export const getConversationMessages = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const mensajes = [];
  const data = {};


  let {
    start_date,
    end_date,
    queue_ids,
    optimized_for_ia,
    include_groups
  } = req.body;

  if(queue_ids && !Array.isArray(queue_ids)) {
    queue_ids = JSON.parse(queue_ids);
  }

  if (!mensajes.length) {
    const ticketsInTimeRange = await Ticket.findAll({
      where: {
        createdAt: {
          [Op.gte]: dayjs(start_date).startOf("day").add(5, "hour").toDate(),
          [Op.lte]: dayjs(end_date).endOf("day").add(5, "hour").toDate()
        },
        ...(!include_groups && { isGroup: false }),
        ...(queue_ids ? { queueId: { [Op.in]: queue_ids } } : {}),
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name"],
          where: {
            isCompanyMember: {
              [Op.or]: [null, false]
            }
          },
          required: true
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ["id", "name"],
          required: true
        },
      ],
      // logging: (sql) => {
      //   mensajes.push(`SQL: ${sql}`);
      // }
    });

    mensajes.push(
      `Se encontraron ${ticketsInTimeRange.length} tickets entre las fechas ${start_date} y ${end_date}`);


    const uniqueContactWhatsappPairs = ticketsInTimeRange.reduce((acc, ticket) => {
      if (ticket.contactId && ticket.whatsappId) {
        const key = `${ticket.contactId}-${ticket.whatsappId}`;
        if (!acc.has(key)) {
          acc.add(key);
          acc.data.push({ contactId: ticket.contactId, whatsappId: ticket.whatsappId });
        }
      }
      return acc;
    }, Object.assign(new Set<string>(), { data: [] }) as Set<string> & { data: { contactId: number, whatsappId: number }[] });

    const ticketsToGetMessages = await Ticket.findAll({
      where: {
        [Op.or]: uniqueContactWhatsappPairs.data.map(pair => ({
          contactId: pair.contactId,
          whatsappId: pair.whatsappId
        }))
      },
      include: [
          { model: Contact, as: "contact", attributes: ["id", "name", "number", "createdAt"] },
          { model: Whatsapp, as: "whatsapp", attributes: ["id", "name", "number"] },
      ],
    });

    const messages = await Message.findAll({
      attributes: ["id", "fromMe", "body", "mediaType", "timestamp", "isPrivate", "ticketId"],
      where: {
        ticketId: {
          [Op.in]: ticketsToGetMessages.map(ticket => ticket.id)
        },
        isPrivate: {
          [Op.or]: [null, false]
        },
        timestamp: {
          [Op.gte]: dayjs(start_date).startOf("day").add(5, "hour").unix(),
          [Op.lte]: dayjs(end_date).endOf("day").add(5, "hour").unix()
        }
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name"],
        },
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
            {
              model: Contact,
              as: "contact",
              attributes: ["id", "name", "number", "isGroup"],
              include: [
                {
                  model: Country,
                  as: "country",
                  attributes: ["id", "name"],
                  required: false
                },
                {
                  model: ContactClientelicencia,
                  as: "contactClientelicencias",
                  attributes: ["id", "traza_clientelicencia_id"],
                  required: false
                }
              ]
            },
            {
              model: Whatsapp,
              as: "whatsapp",
              attributes: ["id", "name", "number"],
              required: true
            },
          ],
          required: true
        }
      ],
      order: [["timestamp", "ASC"]]
    });

    mensajes.push(
      `Se encontraron ${messages.length} mensajes de los tickets recuperados`
    );

    messages.forEach(messageInstance => {
      const message: any = messageInstance.get({ plain: true }); // 👈 Conversión a objeto plano

      if (message.ticket?.id === 27204) {
        console.log("Mensaje de ticket 27204", message);
      }

      const ticketContact = message.ticket.contact;
      const ticketWhatsapp = message.ticket.whatsapp;

      const conversationKey = `${ticketContact?.id}-${ticketWhatsapp?.id}`;

      if (!data[conversationKey]) {
        data[conversationKey] = {
          contact: {
            id: ticketContact?.id,
            name: ticketContact.name,
            number: ticketContact.number,
            createdAt: ticketContact.createdAt,
            country: ticketContact.country?.name || "Sin país",
            isGroup: ticketContact.isGroup,
            contactClientelicencias: ticketContact.contactClientelicencias.map(clientelicencia =>  clientelicencia.traza_clientelicencia_id),
          },
          whatsapp: {
            id: ticketWhatsapp?.id,
            name: ticketWhatsapp?.name,
            number: ticketWhatsapp?.number
          },
          messages: []
        };
      }

      message.ticket_user_name = message.ticket?.user?.name || "Sin asignar";

      // delete message.contact;
      delete message.ticket;

      if (message.body.length > 1000) {
        message.body = message.body.substring(0, 1000) + "...";
      }

      message.date = dayjs.unix(message.timestamp).tz("America/Lima").format("YYYY-MM-DD HH:mm:ss");

      data[conversationKey].messages.push(message);
    })

  }

  let dataToReturn = null;

  dataToReturn = Object.entries(data).map(([conversationId, value]: any) => ({
    conversationId,
    ...value
  }));

  // SI NOS PIDEN OPTIMIZAR PARA IA, COMPRIMIMOS LOS MENSAJES
  if (optimized_for_ia) {
    dataToReturn = dataToReturn.map((item: any) => {

      const ticketsMap = new Map();

      item.messages.forEach(msg => {
        if (!ticketsMap.has(msg.ticketId)) {
          ticketsMap.set(msg.ticketId, {
            user: msg.ticket_user_name,
            messages: []
          });
        }
        const author = msg.fromMe ? "Tú" : "Cliente" + (item.contact?.isGroup ? ` (${msg.contact?.name})` : "");
        const content = msg.mediaType === "image" ? `${msg.body} [imagen]` : msg.body;
        const line = `${msg.date} - ${author}: ${content}`;
        ticketsMap.get(msg.ticketId).messages.push(line);
      });

      let compressedMessages = ""
      let lastTicketId = null;
      let lastUser = null;

      for (const [ticketId, { user, messages }] of ticketsMap.entries()) {
        compressedMessages += `[Ticket (${ticketId}): ${user}]\n` + messages.join('\n') + '\n\n';
        lastTicketId = ticketId;
        lastUser = user;
      }

      compressedMessages = compressedMessages.trim();

      return {
        ...item,
        lastTicketId,
        lastUser,
        messages: compressedMessages,
      };
    });
  }

  return res.status(200).json({
    mensajes,
    data: dataToReturn
  });
};

// ESTA VERSION DE LA FUNCION RECUPERA TODOS LOS TICKETS CREADOS EN LA VENTANA DE TIEMPO Y LUEGO TODOS LOS MENSAJES DE ESOS TICKETS (SIN IMPORTAR LA VENTANA DE TIEMPO)
export const getConversationMessagesV2 = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const mensajes = [];
  const data = {};


  let {
    start_date,
    end_date,
    queue_ids,
    include_groups
  } = req.body;

  if(queue_ids && !Array.isArray(queue_ids)) {
    queue_ids = JSON.parse(queue_ids);
  }

  if (!mensajes.length) {
    const ticketsToGetMessages = await Ticket.findAll({
      attributes: ["id"],
      where: {
        createdAt: {
          [Op.gte]: dayjs(start_date).startOf("day").add(5, "hour").toDate(),
          [Op.lte]: dayjs(end_date).endOf("day").add(5, "hour").toDate()
        },
        ...(!include_groups && { isGroup: false }),
        ...(queue_ids ? { queueId: { [Op.in]: queue_ids } } : {}),
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id"],
          where: {
            isCompanyMember: {
              [Op.or]: [null, false]
            }
          },
          required: true
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ["id"],
          required: true
        },
      ],
    });

    mensajes.push(
      `Se encontraron ${ticketsToGetMessages.length} tickets entre las fechas ${start_date} y ${end_date}`);

    const messages = await Message.findAll({
      attributes: ["id", "fromMe", "body", "mediaType", "timestamp", "isPrivate", "ticketId"],
      where: {
        ticketId: {
          [Op.in]: ticketsToGetMessages.map(ticket => ticket.id)
        }
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name"],
        },
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
            {
              model: Contact,
              as: "contact",
              attributes: ["id", "name", "number", "isGroup"],
              include: [
                {
                  model: Country,
                  as: "country",
                  attributes: ["id", "name"],
                  required: false
                },
                {
                  model: ContactClientelicencia,
                  as: "contactClientelicencias",
                  attributes: ["id", "traza_clientelicencia_id"],
                  required: false
                }
              ]
            },
            {
              model: Whatsapp,
              as: "whatsapp",
              attributes: ["id", "name", "number"],
              required: true
            },
          ],
          required: true
        }
      ],
      order: [["timestamp", "ASC"]]
    });

    mensajes.push(
      `Se encontraron ${messages.length} mensajes de los tickets recuperados`
    );

    messages.forEach(messageInstance => {
      const message: any = messageInstance.get({ plain: true }); // 👈 Conversión a objeto plano

      // if (message.ticket?.id === 27204) {
      //   console.log("Mensaje de ticket 27204", message);
      // }

      const ticketContact = message.ticket.contact;
      const ticketWhatsapp = message.ticket.whatsapp;

      const conversationKey = `${ticketContact?.id}-${ticketWhatsapp?.id}`;

      if (!data[conversationKey]) {
        data[conversationKey] = {
          contact: {
            id: ticketContact?.id,
            name: ticketContact.name,
            number: ticketContact.number,
            createdAt: ticketContact.createdAt,
            country: ticketContact.country?.name || "Sin país",
            isGroup: ticketContact.isGroup,
            contactClientelicencias: ticketContact.contactClientelicencias.map(clientelicencia =>  clientelicencia.traza_clientelicencia_id),
          },
          whatsapp: {
            id: ticketWhatsapp?.id,
            name: ticketWhatsapp?.name,
            number: ticketWhatsapp?.number
          },
          messages: []
        };
      }

      message.ticket_user_name = message.ticket?.user?.name || "Sin asignar";

      delete message.contact;
      delete message.ticket;

      if (message.body.length > 1000) {
        message.body = message.body.substring(0, 1000) + "...";
      }

      message.date = dayjs.unix(message.timestamp).tz("America/Lima").format("YYYY-MM-DD HH:mm:ss");

      data[conversationKey].messages.push(message);
    })
  }

  let dataToReturn = null;

  dataToReturn = Object.entries(data).map(([conversationId, value]: any) => ({
    conversationId,
    ...value
  }));

  return res.status(200).json({
    mensajes,
    data: dataToReturn
  });
};

export const getConversationMessagesFromTicket = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const mensajes = [];
  const data = {};


  let {
    ticketId
  } = req.body;

  if (!ticketId) {
    throw new AppError("Falta el ticketId");
  }

  if (!mensajes.length) {
    const ticketsInTimeRange = await Ticket.findAll({
      where: {
        id: ticketId,
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name"],
          required: true
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ["id", "name"],
          required: true
        },
      ],
      // logging: (sql) => {
      //   mensajes.push(`SQL: ${sql}`);
      // }
    });

    mensajes.push(
      `Se encontraron ${ticketsInTimeRange.length} tickets con el ID ${ticketId}`);


    const uniqueContactWhatsappPairs = ticketsInTimeRange.reduce((acc, ticket) => {
      if (ticket.contactId && ticket.whatsappId) {
        const key = `${ticket.contactId}-${ticket.whatsappId}`;
        if (!acc.has(key)) {
          acc.add(key);
          acc.data.push({ contactId: ticket.contactId, whatsappId: ticket.whatsappId });
        }
      }
      return acc;
    }, Object.assign(new Set<string>(), { data: [] }) as Set<string> & { data: { contactId: number, whatsappId: number }[] });

    const ticketsToGetMessages = await Ticket.findAll({
      where: {
        [Op.or]: uniqueContactWhatsappPairs.data.map(pair => ({
          contactId: pair.contactId,
          whatsappId: pair.whatsappId
        }))
      },
      include: [
          { model: Contact, as: "contact", attributes: ["id", "name", "number", "createdAt"] },
          { model: Whatsapp, as: "whatsapp", attributes: ["id", "name", "number"] },
      ],
    });

    const messages = await Message.findAll({
      attributes: ["id", "fromMe", "body", "mediaType", "timestamp", "isPrivate", "ticketId"],
      where: {
        ticketId: {
          [Op.in]: ticketsToGetMessages.map(ticket => ticket.id)
        },
        isPrivate: {
          [Op.or]: [null, false]
        },
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name"],
        },
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id"],
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "name"],
            },
            {
              model: Contact,
              as: "contact",
              attributes: ["id", "name", "number"],
              include: [
                {
                  model: Country,
                  as: "country",
                  attributes: ["id", "name"],
                  required: false
                }
              ]
            },
            {
              model: Whatsapp,
              as: "whatsapp",
              attributes: ["id", "name", "number"],
              required: true
            },
          ],
          required: true
        }
      ],
      order: [["timestamp", "ASC"]]
    });

    mensajes.push(
      `Se encontraron ${messages.length} mensajes de los tickets recuperados`
    );

    messages.forEach(messageInstance => {
      const message: any = messageInstance.get({ plain: true }); // 👈 Conversión a objeto plano

      if (message.ticket?.id === 27204) {
        console.log("Mensaje de ticket 27204", message);
      }

      const ticketContact = message.ticket.contact;
      const ticketWhatsapp = message.ticket.whatsapp;

      const conversationKey = `${ticketContact?.id}-${ticketWhatsapp?.id}`;

      if (!data[conversationKey]) {
        data[conversationKey] = {
          contact: {
            id: ticketContact?.id,
            name: ticketContact.name,
            number: ticketContact.number,
            createdAt: ticketContact.createdAt,
            country: ticketContact.country?.name || "Sin país"
          },
          whatsapp: {
            id: ticketWhatsapp?.id,
            name: ticketWhatsapp?.name,
            number: ticketWhatsapp?.number
          },
          messages: []
        };
      }

      message.ticket_user_name = message.ticket?.user?.name || "Sin asignar";

      delete message.contact;
      delete message.ticket;

      if (message.body.length > 1000) {
        message.body = message.body.substring(0, 1000) + "...";
      }

      message.date = dayjs.unix(message.timestamp).tz("America/Lima").format("YYYY-MM-DD HH:mm:ss");

      data[conversationKey].messages.push(message);
    })

  }

  let dataToReturn = null;

  dataToReturn = Object.entries(data).map(([conversationId, value]: any) => ({
    conversationId,
    ...value
  }));

  // SI NOS PIDEN OPTIMIZAR PARA IA, COMPRIMIMOS LOS MENSAJES
  dataToReturn = dataToReturn.map((item: any) => {

    const ticketsMap = new Map();

    item.messages.forEach(msg => {
      if (!ticketsMap.has(msg.ticketId)) {
        ticketsMap.set(msg.ticketId, {
          user: msg.ticket_user_name,
          messages: []
        });
      }
      const author = msg.fromMe ? "Tú" : "Cliente";
      const content = msg.mediaType === "image" ? `${msg.body} [imagen]` : msg.body;
      const line = `${msg.date} - ${author}: ${content}`;
      ticketsMap.get(msg.ticketId).messages.push(line);
    });

    let compressedMessages = ""

    for (const [ticketId, { user, messages }] of ticketsMap.entries()) {
      compressedMessages += `[Ticket: ${user}]\n` + messages.join('\n') + '\n\n';
    }

    compressedMessages = compressedMessages.trim();

    return {
      ...item,
      messages: compressedMessages,
    };
  });

  return res.status(200).json({
    mensajes,
    data: dataToReturn
  });
};

export const getUpdatedTickets = async (
  req: Request,
  res: Response
): Promise<Response> => {

  const mensajes = [];
  const data: any = {};

  let {
    start_date,
    end_date,
    queue_ids,
    exclude_groups
  } = req.body;

  if(queue_ids && !Array.isArray(queue_ids)) {
    queue_ids = JSON.parse(queue_ids);
  }

  if (!mensajes.length) {
    let tickets: any = await Ticket.findAll({
      attributes: ["id", "status", "isGroup", "createdAt", "updatedAt"],
      where: {
        updatedAt: {
          [Op.gte]: dayjs(start_date).startOf("day").add(5, "hour").toDate(),
          [Op.lte]: dayjs(end_date).endOf("day").add(5, "hour").toDate()
        },
        ...(exclude_groups && { isGroup: false }),
        ...(queue_ids ? { queueId: { [Op.in]: queue_ids } } : {}),
      },
      include: [
        {
          model: Contact,
          as: "contact",
          attributes: ["id", "name", "number", "isGroup"],
          where: {
            isCompanyMember: {
              [Op.or]: [null, false]
            }
          },
          include: [
            {
              model: ContactClientelicencia,
              as: "contactClientelicencias",
              attributes: ["id", "traza_clientelicencia_id"],
              required: false
            }
          ],
          required: true
        },
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ["id", "name", "number"],
          required: true
        },
        {
          model: Queue,
          as: "queue",
          attributes: ["id", "name"],
          required: true
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
        {
          model: Message,
          as: "messages",
          attributes: ["id", "fromMe", "body", "mediaType", "timestamp", "isPrivate", "ticketId"],
          include: [
            {
              attributes: ["id", "name", "isCompanyMember"],
              model: Contact,
              as: "contact",
              required: false,
            }
          ],
          required: true,
          separate: true,
          order: [["timestamp", "DESC"]] // ✅ Los más recientes primero
        }
      ],
      order: [["updatedAt", "ASC"]]
    });

    tickets = tickets.map(ticket => ticket.get({ plain: true }));

    tickets = tickets.map(ticket => {
      ticket.messages = JSON.parse(JSON.stringify(ticket.messages.slice(0, 150)));
      ticket.messages = ticket.messages.reverse();
      return ticket
    })

    mensajes.push(
      `Se encontraron ${tickets.length} tickets entre las fechas ${start_date} y ${end_date}`
    );

    data.tickets = tickets;
  }

  return res.status(200).json({
    mensajes,
    data
  });
};

export const findGroupByName = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log("=".repeat(80));
  console.log("[ExternalApiController] 📞 CALL FOR findGroupByName");
  console.log("[ExternalApiController] Body:", JSON.stringify(req.body, null, 2));
  console.log("=".repeat(80));

  const { groupName, whatsappId } = req.body;

  // Validaciones
  if (!groupName || groupName.trim().length === 0) {
    console.log("[ExternalApiController] ❌ groupName vacío");
    return res.status(400).json({
      success: false,
      error: "MISSING_GROUP_NAME",
      message: "El campo 'groupName' es requerido y no puede estar vacío"
    });
  }

  if (!whatsappId || typeof whatsappId !== "number") {
    console.log("[ExternalApiController] ❌ whatsappId inválido:", whatsappId);
    return res.status(400).json({
      success: false,
      error: "INVALID_WHATSAPP_ID",
      message: "El campo 'whatsappId' es requerido y debe ser un número"
    });
  }

  console.log("[ExternalApiController] ✅ Validaciones pasadas, llamando al servicio...");

  try {
    const result = await FindGroupByNameService({
      groupName,
      whatsappId
    });

    console.log("[ExternalApiController] 📊 Resultado del servicio:", result.success ? "SUCCESS" : "FAILED");

    if (!result.success) {
      let statusCode = 500;
      
      if (result.error === "WHATSAPP_NOT_FOUND") {
        statusCode = 404;
      } else if (result.error === "WHATSAPP_DISCONNECTED") {
        statusCode = 503;
      } else if (result.error === "GROUP_NOT_FOUND") {
        statusCode = 404;
      }

      console.log("[ExternalApiController] ⚠️ Retornando error con código:", statusCode);
      return res.status(statusCode).json(result);
    }

    console.log("[ExternalApiController] ✅ Retornando respuesta exitosa");
    return res.status(200).json(result);

  } catch (error) {
    console.log("[ExternalApiController] ❌ ERROR CAPTURADO:");
    console.log("[ExternalApiController] Error:", error.message);
    console.log("[ExternalApiController] Stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_ERROR",
      message: `Error interno del servidor: ${error.message}`
    });
  }
};

export const sendMessageToTicket = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log("=".repeat(80));
  console.log("[ExternalApiController] 📞 CALL FOR sendMessageToTicket");
  console.log("[ExternalApiController] Body:", JSON.stringify(req.body, null, 2));
  console.log("=".repeat(80));

  const { ticketId, message, calendarEvent, calendarEvents } = req.body;

  // Normalizar calendarEvent: si viene como array (calendarEvents), tomar el primero
  let normalizedCalendarEvent = calendarEvent;
  if (!normalizedCalendarEvent && calendarEvents && Array.isArray(calendarEvents) && calendarEvents.length > 0) {
    normalizedCalendarEvent = calendarEvents[0];
    console.log("[ExternalApiController] 📋 calendarEvents detectado como array, usando el primer evento");
  }

  // Validaciones
  if (!ticketId || typeof ticketId !== "number") {
    console.log("[ExternalApiController] ❌ ticketId inválido:", ticketId);
    return res.status(400).json({
      success: false,
      error: "INVALID_TICKET_ID",
      message: "El campo 'ticketId' es requerido y debe ser un número"
    });
  }

  if (!message || message.trim().length === 0) {
    console.log("[ExternalApiController] ❌ message vacío");
    return res.status(400).json({
      success: false,
      error: "MISSING_MESSAGE",
      message: "El campo 'message' es requerido y no puede estar vacío"
    });
  }

  console.log("[ExternalApiController] ✅ Validaciones pasadas, llamando al servicio...");

  try {
    const result = await SendMessageToTicketService({
      ticketId,
      message,
      calendarEvent: normalizedCalendarEvent
    });

    console.log("[ExternalApiController] 📊 Resultado del servicio:", result.success ? "SUCCESS" : "FAILED");

    if (!result.success) {
      let statusCode = 500;
      
      if (result.error === "TICKET_NOT_FOUND") {
        statusCode = 404;
      }

      console.log("[ExternalApiController] ⚠️ Retornando error con código:", statusCode);
      return res.status(statusCode).json(result);
    }

    console.log("[ExternalApiController] ✅ Retornando respuesta exitosa");
    return res.status(200).json(result);

  } catch (error) {
    console.log("[ExternalApiController] ❌ ERROR CAPTURADO:");
    console.log("[ExternalApiController] Error:", error.message);
    console.log("[ExternalApiController] Stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_ERROR",
      message: `Error interno del servidor: ${error.message}`
    });
  }
};

export const fixGroupNames = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const result = await FixGroupNamesService();
    return res.status(200).json(result);
  } catch (error) {
    console.error('[fixGroupNames] Error:', error);
    return res.status(500).json({
      error: 'Error al corregir nombres de grupos',
      message: error.message
    });
  }
};

export const sendMessageToContact = async (
  req: Request,
  res: Response
): Promise<Response> => {
  console.log("=".repeat(80));
  console.log("[ExternalApiController] 📞 CALL FOR sendMessageToContact");
  console.log("[ExternalApiController] Body:", JSON.stringify(req.body, null, 2));
  console.log("=".repeat(80));

  const { toNumber, message, fromNumber, userId, queueId } = req.body;

  // Validaciones
  if (!toNumber || typeof toNumber !== "string") {
    console.log("[ExternalApiController] ❌ toNumber inválido:", toNumber);
    return res.status(400).json({
      success: false,
      error: "INVALID_TO_NUMBER",
      message: "El campo 'toNumber' es requerido y debe ser un string"
    });
  }

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    console.log("[ExternalApiController] ❌ message vacío o inválido");
    return res.status(400).json({
      success: false,
      error: "INVALID_MESSAGE",
      message: "El campo 'message' es requerido y no puede estar vacío"
    });
  }

  console.log("[ExternalApiController] ✅ Validaciones pasadas, llamando al servicio...");

  try {
    const result = await SendMessageToContactService({
      toNumber,
      message,
      fromNumber,
      userId,
      queueId
    });

    console.log("[ExternalApiController] 📊 Resultado del servicio:", result.success ? "SUCCESS" : "FAILED");

    if (!result.success) {
      let statusCode = 500;
      
      if (result.error === "NO_WHATSAPP_AVAILABLE") {
        statusCode = 404;
      } else if (result.error === "SEND_ERROR") {
        statusCode = 400;
      }

      console.log("[ExternalApiController] ⚠️ Retornando error con código:", statusCode);
      return res.status(statusCode).json(result);
    }

    console.log("[ExternalApiController] ✅ Retornando respuesta exitosa");
    return res.status(200).json(result);

  } catch (error) {
    console.log("[ExternalApiController] ❌ ERROR CAPTURADO:");
    console.log("[ExternalApiController] Error:", error.message);
    console.log("[ExternalApiController] Stack:", error.stack);

    return res.status(500).json({
      success: false,
      error: "INTERNAL_ERROR",
      message: `Error interno del servidor: ${error.message}`
    });
  }
};

const NOTIFICATION_STATUS_MAP: Record<string, string> = {
  pending: "pendiente",
  sent: "enviado",
  failed: "fallido"
};

export const getNotificationHistory = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    localIds,
    channel = "encuesta",
    from,
    to,
    limit
  } = req.query as {
    localIds?: string;
    channel?: string;
    from?: string;
    to?: string;
    limit?: string;
  };

  const where: any = {};

  if (channel) {
    where.channel = channel;
  }

  const parsedLocalIds = localIds
    ? localIds
        .split(",")
        .map((id) => Number(id.trim()))
        .filter((id) => !isNaN(id))
    : [];

  if (parsedLocalIds.length > 0) {
    where.localId = { [Op.in]: parsedLocalIds };
  }

  if (from || to) {
    where.createdAt = {};
    if (from) {
      where.createdAt[Op.gte] = dayjs(from).toDate();
    }
    if (to) {
      where.createdAt[Op.lte] = dayjs(to).toDate();
    }
  }

  const parsedLimit = limit
    ? Math.min(Math.max(Number(limit), 1), 500)
    : 100;

  const requests = await SendMessageRequest.findAll({
    where,
    order: [["createdAt", "DESC"]],
    limit: parsedLimit
  });

  const data = requests.map((request) => ({
    id: request.id,
    notificationType: request.notificationType,
    recipientName: request.recipientName,
    recipientPhone: request.toNumber,
    surveyName: request.surveyName,
    classification: request.classification,
    clientName: request.clientName,
    clientPhone: request.clientPhone,
    localId: request.localId,
    channel: request.channel,
    status: NOTIFICATION_STATUS_MAP[request.status] || request.status,
    sentAt: request.createdAt,
    message: request.message,
    fromNumber: request.fromNumber
  }));

  return res.status(200).json({
    mensajes: [],
    tipo: "1",
    data
  });
};

export const getTicketsByClientelicenciaId = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { clientelicenciaId } = req.query;

  if (!clientelicenciaId) {
    throw new AppError("Falta el parámetro clientelicenciaId", 400);
  }

  const clientelicenciaIdNum = Number(clientelicenciaId);
  if (isNaN(clientelicenciaIdNum)) {
    throw new AppError("clientelicenciaId debe ser un número", 400);
  }

  const contacts = await Contact.findAll({
    attributes: ["id"],
    include: [
      {
        model: ContactClientelicencia,
        as: "contactClientelicencias",
        where: {
          traza_clientelicencia_id: clientelicenciaIdNum
        },
        required: true
      }
    ]
  });

  if (!contacts || contacts.length === 0) {
    return res.status(200).json({
      tickets: [],
      mensaje: "No se encontraron contactos con ese clientelicenciaId"
    });
  }

  const contactIds = contacts.map(c => c.id);

  const tickets = await Ticket.findAll({
    where: {
      contactId: { [Op.in]: contactIds }
    },
    include: [
      {
        model: Contact,
        as: "contact",
        include: [
          "extraInfo",
          { model: Country, as: "country", required: false },
          "contactClientelicencias"
        ]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      },
      {
        model: User,
        as: "participantUsers",
        required: false
      },
      {
        model: Message,
        as: "messages",
        attributes: ["id", "fromMe", "body", "mediaType", "timestamp", "isPrivate"],
        separate: true,
        order: [["timestamp", "DESC"]],
        limit: 15
      }
    ],
    order: [["updatedAt", "DESC"]]
  });

  const frontendUrl = process.env.FRONTEND_URL || "https://wa-app.restaurant.pe";

  const result = tickets.map(ticket => {
    const plain = ticket.get({ plain: true }) as any;
    
    if (plain.messages) {
      plain.messages = plain.messages
        .reverse()
        .map((msg: any) => {
          if (msg.body && msg.body.length > 1000) {
            msg.body = msg.body.substring(0, 1000) + "...";
          }
          msg.date = dayjs.unix(msg.timestamp).tz("America/Lima").format("YYYY-MM-DD HH:mm:ss");
          return msg;
        });
    }

    plain.ticketUrl = `${frontendUrl}/tickets/${plain.id}`;
    
    return plain;
  });

  return res.status(200).json({ tickets: result });
};

