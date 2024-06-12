import { Request, Response } from "express";
import { getWbot } from "../libs/wbot";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const update = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;

  const { whatsapp } = await UpdateWhatsAppService({
    whatsappId,
    whatsappData: { session: "" }
  });

  StartWhatsAppSession(whatsapp);

  return res.status(200).json({ message: "Starting session." });
};

const remove = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsapp = await ShowWhatsAppService(whatsappId);

  const wbot = getWbot(whatsapp.id);

  wbot.logout();

  return res.status(200).json({ message: "Session disconnected." });
};

const updateWppChatslastMessageTimestamp = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;

  // console.log(whatsappId);

  const whatsapp = await ShowWhatsAppService(whatsappId);

  const wbot = getWbot(whatsapp.id);

  const BATCH_SIZE = 30; // Ajusta este valor según sea necesario

  // Paso 1: Obtener los chats locales desde la base de datos
  const localChats = await Ticket.findAll({
    attributes: ["id", "lastMessageTimestamp"],
    where: {
      lastMessageTimestamp: null, // Solo actualizamos los que tienen lastMessageTimestamp nulo
      whatsappId: whatsappId
    },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["isGroup", "number"]
      }
    ]
  });

  // Dividir los chats en lotes
  for (let i = 0; i < localChats.length; i += BATCH_SIZE) {
    const batch = localChats.slice(i, i + BATCH_SIZE);

    // Crear promesas para cada chat en el lote
    const updatePromises = batch.map(async chat => {
      try {
        // console.log(
        //   "antes de buscar el chat",
        //   chat.contact.number,
        //   chat.contact.isGroup
        // );

        // Paso 2: Buscar cada chat local en la API externa
        const externalChat = await wbot.getChatById(
          // `${chat.contact.number}${chat.contact.isGroup ? "g.us" : "c.us"}`
          `${chat.contact.number}${chat.contact.isGroup ? "@g.us" : "@c.us"}`
        );

        // console.log(
        //   "encontrado el externalChat",
        //   externalChat,
        //   "para el chat",
        //   chat.id
        // );

        // Paso 3: Actualizar el registro local con los datos de la API externa
        await Ticket.update(
          { lastMessageTimestamp: externalChat.timestamp },
          { where: { id: chat.id } }
        );
      } catch (error) {
        console.error(`Error actualizando chat con ID ${chat}:`, error);
      }
    });

    // Esperar a que todas las actualizaciones del lote se completen antes de proceder al siguiente lote
    await Promise.all(updatePromises);
  }

  // console.log("Chats actualizados correctamente");

  return res.status(200).json({ message: "Session disconnected." });
};

export default { store, remove, update, updateWppChatslastMessageTimestamp };
