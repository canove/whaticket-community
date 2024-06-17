import { Request, Response } from "express";
import { GroupChat } from "whatsapp-web.js";
import { getWbot } from "../libs/wbot";
import Contact from "../models/Contact";
import GroupContact from "../models/GroupContact";
import Ticket from "../models/Ticket";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";
import { verifyContact } from "../services/WbotServices/wbotMessageListener";
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

const syncGroupContactsTable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    // Extrae el ID de WhatsApp de los parámetros de la solicitud
    const { whatsappId } = req.params;

    if (!whatsappId) {
      throw new Error("whatsappId is missing in request parameters");
    }

    console.log("whatsappId:", whatsappId);

    // Obtiene la información del servicio de WhatsApp
    const whatsapp = await ShowWhatsAppService(whatsappId);

    if (!whatsapp) {
      throw new Error("WhatsApp service not found");
    }

    console.log("whatsapp:", whatsapp);

    // Obtiene el bot de WhatsApp usando el ID del servicio de WhatsApp
    const wbot = getWbot(whatsapp.id);

    if (!wbot) {
      throw new Error("WhatsApp bot not found");
    }

    console.log("wbot:", wbot);

    // Obtiene todos los chats del bot de WhatsApp
    let allChats = await wbot.getChats();

    if (!allChats) {
      throw new Error("No chats found");
    }

    console.log("allChats:", allChats.length);

    // Filtra los chats para obtener solo los grupos
    const groupChats = allChats.filter(chat => chat.isGroup);

    console.log("groupChats:", groupChats.length);

    for (const groupChat of groupChats) {
      const groupChatDetails = groupChat as GroupChat;

      console.log("Processing groupChat:", groupChatDetails);

      console.log(
        "groupChatDetails: to search in db",
        groupChatDetails.id.user
      );

      // Verifica que groupChatDetails.id.user exista
      if (!groupChatDetails.id || !groupChatDetails.id.user) {
        throw new Error("Group chat details are missing id or user");
      }

      // Busca el contacto del grupo en nuestra base de datos
      const groupContactInDB = await Contact.findOne({
        where: {
          number: groupChatDetails.id.user
        }
      });

      console.log("groupContactInDB:", groupContactInDB);

      // Si el contacto del grupo no está en nuestra base de datos, no sincroniza sus contactos
      if (groupContactInDB) {
        const groupParticipants = groupChatDetails.participants;

        if (!groupParticipants) {
          throw new Error("Group participants not found");
        }

        console.log("groupParticipants:", groupParticipants.length);

        for (const participant of groupParticipants) {
          // Verifica que participant.id.user exista
          if (!participant.id || !participant.id.user) {
            throw new Error("Participant details are missing id or user");
          }

          // Busca el contacto del participante en nuestra base de datos
          const participantContactInDB = await Contact.findOne({
            where: {
              number: participant.id.user
            }
          });

          let participantContactId;

          console.log("participant:", participant);
          console.log("participantInDb:", participantContactInDB);

          // Si el participante no está registrado en nuestra base de datos, obtén su información y verifica su contacto
          if (!participantContactInDB) {
            console.log("participant not in DB:", participant.id._serialized);

            const participantNotInDB = await wbot.getContactById(
              participant.id._serialized
            );

            console.log("participantNotInDB:", participantNotInDB);

            if (participantNotInDB) {
              const verifiedParticipantContact = await verifyContact(
                participantNotInDB
              );

              console.log(
                "verifiedParticipantContact:",
                verifiedParticipantContact
              );

              if (verifiedParticipantContact) {
                participantContactId = verifiedParticipantContact.id;
              }
            }
          } else {
            participantContactId = participantContactInDB.id;
          }

          console.log("participantContactId:", participantContactId);

          // Si el ID del contacto del participante está disponible, crea o encuentra el contacto del grupo en la base de datos
          if (participantContactId) {
            console.log("Creating or finding GroupContact with:", {
              groupContactId: groupContactInDB.id,
              participantContactId: participantContactId,
              whatsappId: whatsappId
            });

            const GroupContactEncontrado = await GroupContact.findOne({
              where: {
                groupContactId: groupContactInDB.id,
                participantContactId: participantContactId,
                whatsappId: whatsappId
              }
            });

            // si no se encuentra la relación buscada añadirla
            if (!GroupContactEncontrado) {
              GroupContact.create({
                groupContactId: groupContactInDB.id,
                participantContactId: participantContactId,
                whatsappId: whatsappId
              });
            }

            // await GroupContact.findOrCreate({
            //   where: {
            //     groupContactId: groupContactInDB.id,
            //     participantContactId: participantContactId,
            //     whatsappId: whatsappId
            //   },
            //   defaults: {
            //     groupContactId: groupContactInDB.id,
            //     participantContactId: participantContactId,
            //     whatsappId: whatsappId
            //   }
            // });
          }
        }
      } else {
        console.log("Group contact not found in DB:", groupChatDetails.id.user);
      }
    }
  } catch (error) {
    console.log("Error syncing group contacts table:", error);

    return res.status(400).json({ success: false, error: error.message });
  }

  return res.status(200).json({
    success: true,
    message: "Group contacts table synced successfully."
  });
};

export default {
  store,
  remove,
  update,
  updateWppChatslastMessageTimestamp,
  syncGroupContactsTable
};
