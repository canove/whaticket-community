import FileRegister from "../../database/models/FileRegister";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import Whatsapp from "../../database/models/Whatsapp";
import { subHours } from "date-fns";
import { Op, Sequelize } from "sequelize";
import Contact from "../../database/models/Contact";

interface OfficialReport {
  id_session: string;
  content: string;
  type: string;
  media_link: string;
  create_at_message: string;
  update_at_message: string;
  external_id: string;
  client_phone_number: string;
  var1: string;
  var2: string;
  var3: string;
  var4: string;
  var5: string;
  create_at_session: string;
  update_at_session: string;
  phone_number: string;
  status: string;
  direction: string;
  session: string;
  destination_number_type: string;
}

interface Request {
  companyId: number;
  limit: string;
  pageNumber: string;
  phoneNumber: string;
  clientPhoneNumber: string;
}

interface Response {
  reports: OfficialReport[];
  count: number;
}

const ListOfficialWhatsappService = async ({
  companyId,
  limit = "10",
  pageNumber = "1",
  phoneNumber,
  clientPhoneNumber
}: Request): Promise<Response> => {
  let whereConditionContact = null;
  let whereConditionWhatsapp = null;

  if (clientPhoneNumber) {
    whereConditionContact = {
      number: { [Op.like]: `%${clientPhoneNumber}%` }
    }
  }

  if (phoneNumber) {
    whereConditionWhatsapp = {
      name: { [Op.like]: `%${phoneNumber}%` }
    }
  }

  const offset = +limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    attributes: {
      include: [
        [
          Sequelize.literal(`(
            SELECT id FROM Messages AS LastMessage
              WHERE 
                Message.ticketId = LastMessage.ticketId AND 
                Message.id != LastMessage.id AND 
                LastMessage.createdAt >= DATE_SUB(Message.createdAt, INTERVAL 1 DAY) AND
                LastMessage.createdAt <= Message.createdAt
            LIMIT 1
          )`),
          'lastMessage'
        ]
      ]
    },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["number"],
        required: true,
        where: whereConditionContact
      },
      {
        model: Ticket,
        as: "ticket",
        attributes: ["id"],
        where: { companyId },
        include: [
          {
            model: Whatsapp,
            as: "whatsapp",
            attributes: ["name"],
            required: true,
            where: whereConditionWhatsapp
          }
        ],
        required: true
      },
      {
        model: FileRegister,
        as: "fileRegister",
        required: false
      }
    ],
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? offset : null,
    order: [["createdAt", "DESC"]]
  });

  let reports = [];

  for (const message of messages) {
    let report = null;

    let session = "inbound";
    let direction = "incoming";

    if (message.lastMessage) {
      session = "messages";
    }

    let external_id = null;
    let var1 = null;
    let var2 = null;
    let var3 = null;
    let var4 = null;
    let var5 = null;
    let create_at_session = null;
    let update_at_session = null;
    let status = null;

    if (message.fileRegister) {
      session = "outbound";
      direction = "outgoing_template";

      external_id = message.fileRegister.id;
      var1 = message.fileRegister.var1;
      var2 = message.fileRegister.var2;
      var3 = message.fileRegister.var3;
      var4 = message.fileRegister.var4;
      var5 = message.fileRegister.var5;
      create_at_session = message.fileRegister.createdAt;
      update_at_session = message.fileRegister.updatedAt;
      status = getStatus(message.fileRegister);
    } else {
      external_id = "";
      var1 = "";
      var2 = "";
      var3 = "";
      var4 = "";
      var5 = "";
      create_at_session = "";
      update_at_session = "";
      status = "";
    }

    report = {
      "id_session": message.id,
      "content": message.body,
      "type": message.mediaType,
      "media_link": message.mediaUrl,
      "create_at_message": message.createdAt,
      "update_at_message": message.updatedAt,
      "client_phone_number": message.contact.number,
      "phone_number": message.ticket.whatsapp.name,
      "session": session,
      "direction": direction,
      "destination_number_type": "MOBILE",
      "external_id": external_id,
      "var1": var1,
      "var2": var2,
      "var3": var3,
      "var4": var4,
      "var5": var5,
      "create_at_session": create_at_session,
      "update_at_session": update_at_session,
      "status": status
    }

    reports.push(report);
  }

  // for (const message of messages) {
  //   let report = null;

  //   let direction = "incoming";
  //   let session = "inbound";

  //   const id_session = message.id;
  //   const content = message.body;
  //   const type = message.mediaType;
  //   const media_link = message.mediaUrl;
  //   const create_at_message = message.createdAt;
  //   const update_at_message = message.updatedAt;

  //   report = {
  //     id_session,
  //     content,
  //     type,
  //     media_link,
  //     create_at_message,
  //     update_at_message
  //   };

  //   const messageIn24Hours = await Message.findOne({
  //     where: {
  //       id: { [Op.ne]: message.id },
  //       createdAt: { [Op.between]: [+subHours(new Date(), 24), +new Date()] }
  //     }
  //   });

  //   if (messageIn24Hours) {
  //     session = "messages";
  //   }

  //   const fileRegister = await FileRegister.findOne({
  //     attributes: [
  //       "msgWhatsId",
  //       "var1",
  //       "var2",
  //       "var3",
  //       "var4",
  //       "var5",
  //       "whatsappId",
  //       "phoneNumber",
  //       "createdAt",
  //       "updatedAt",
  //       "id",
  //       "readAt",
  //       "deliveredAt",
  //       "sentAt",
  //       "errorAt"
  //     ],
  //     include: [
  //       {
  //         model: Whatsapp,
  //         as: "whatsapp",
  //         attributes: ["name"],
  //         required: true
  //       },
  //     ],
  //     where: { msgWhatsId: message.id }
  //   });

  //   if (fileRegister) {
  //     direction = "outgoing_template";
  //     session = "outbound";

  //     const external_id = fileRegister.id;
  //     const client_phone_number = fileRegister.phoneNumber;
  //     const var1 = fileRegister.var1;
  //     const var2 = fileRegister.var2;
  //     const var3 = fileRegister.var3;
  //     const var4 = fileRegister.var4;
  //     const var5 = fileRegister.var5;
  //     const create_at_session = fileRegister.createdAt;
  //     const update_at_session = fileRegister.updatedAt;
      
  //     const phone_number = fileRegister.whatsapp.name;
  //     const status = getStatus(fileRegister);

  //     report = {
  //       ...report,
  //       external_id,
  //       client_phone_number,
  //       var1,
  //       var2,
  //       var3,
  //       var4,
  //       var5,
  //       create_at_session,
  //       update_at_session,
  //       status,
  //       phone_number
  //     }
  //   };

  //   report = {
  //     ...report,
  //     direction,
  //     session,
  //     destination_number_type: "MOBILE"
  //   }

  //   reports.push(report);
  // }

  return { count, reports };
};

const getStatus = (fileRegister) => {
  if (fileRegister.errorAt) return "failed";
  if (fileRegister.sentAt) return "sent";
  if (fileRegister.deliveredAt) return "delivered";
  if (fileRegister.readAt) return "read";

  return "";
};

export default ListOfficialWhatsappService;

/*
---------------------------------

  SELECT
    Messages.id AS "id_session",
    Messages.body AS "content",
    Messages.mediaType AS "type",
    Messages.mediaUrl AS "media_link",
    Messages.createdAt AS "create_at_message",
    Messages.updatedAt AS "update_at_message",
    
    FileRegisters.id AS "external_id",
    FileRegisters.var1 AS "var1",
    FileRegisters.var2 AS "var2",
    FileRegisters.var3 AS "var3",
    FileRegisters.var4 AS "var4",
    FileRegisters.var5 AS "var5",
    FileRegisters.createdAt AS "create_at_session",
    FileRegisters.updatedAt AS "update_at_session",
      
      Contacts.number AS "client_phone_number",
      Whatsapps.name AS "phone_number",
      
      IF (
      FileRegisters.errorAt, "failed",
          IF (
        FileRegisters.sentAt, "sent", 
              IF (
          FileRegisters.deliveredAt, "delivered",
                  IF (FileRegisters.readAt, "read", "")
              )
      )
    ) 
      AS "status",

    IF (
      FileRegisters.id,
      "outbound",
      IF (
        EXISTS (
          SELECT id FROM Messages AS LastMessages
          WHERE 
            Messages.ticketId = LastMessages.ticketId AND 
            Messages.id != LastMessages.id AND 
            LastMessages.createdAt >= DATE_SUB(Messages.createdAt, INTERVAL 1 DAY) AND
            LastMessages.createdAt <= Messages.createdAt
        ),
        "messages",
        "inbound"
      )
    )
    AS "session",
    
    IF (
		FileRegisters.id,
        "outgoing_template",
        "incoming"
    )
    AS "direction",
    
    "MOBILE" AS "destination_number_type"
    FROM Messages
    LEFT OUTER JOIN FileRegisters
      ON Messages.id = FileRegisters.msgWhatsId
    INNER JOIN Contacts
      ON Messages.contactId = Contacts.id
    INNER JOIN Tickets
      ON Messages.ticketId = Tickets.id
    INNER JOIN Whatsapps
      ON Tickets.whatsappId = Whatsapps.id
    ORDER BY create_at_message DESC
    LIMIT 10
    OFFSET 0
;

---------------------------------

*id_session -> msgWhatsId [FileRegister]
*wallet_number -> var [FileRegister]
*phone_number -> whatsappId [FileRegister] -> phone number 
*client_phone_number -> phoneNumber [FileRegister]
*destination_number_type -> "MOBILE"
*create_at_session -> createdAt [FileRegister]
*update_at_session -> updatedAt [FileRegister]
*wallet -> var [FileRegister]
*external_id -> ID [FileRegister]
*status -> read/delivered/received/error [FileRegister]
direction -> 
session -> 
*content -> BODY [Message]
*create_at_message -> createdAt [Message]
*update_at_message -> updatedAt [Message]
*type -> mediaType [Message]
*media_link -> mediaUrl [Message]
*job_id -> var [FileRegister]
*contaCartao -> var [FileRegister]

{
    "msgWhatsId":"wamid.HBgMNTU0MTk4ODg2MzE5FQIAERgSODI4NjE4QkVBNUU1ODhEMEEyAA==",         # id_session
    "var1":null,                                                                           # wallet_number / wallet / job_id / contaCartao
    "var2":"",                                                                             # wallet_number / wallet / job_id / contaCartao
    "var3":"",                                                                             # wallet_number / wallet / job_id / contaCartao
    "var4":"",                                                                             # wallet_number / wallet / job_id / contaCartao
    "var5":"",                                                                             # wallet_number / wallet / job_id / contaCartao
    "whatsappId":999,
    "phoneNumber":"41998886319",                                                           # client_phone_number
    "createdAt":"2022-12-19T15:01:21.000Z",                                                # create_at_session
    "updatedAt":"2022-12-19T15:01:21.000Z",                                                # update_at_session
    "id":1,                                                                                # external_id
    "readAt":"2022-12-19T15:01:21.000Z",                                                   # status: read
    "deliveredAt":"2022-12-19T15:01:21.000Z",                                              # status: delivered
    "sentAt":"2022-12-19T15:01:21.000Z",                                                   # status: sent
    "errorAt":null,                                                                        # status: failed
    "whatsapp.name":"5511965577444",                                                       # phone_number
    "messageData.body":"Olá {{name}}, aqui é a Tati da Tricard.",                          # content
    "messageData.createdAt":"2022-12-20T17:09:30.267Z",                                    # create_at_message
    "messageData.updatedAt":"2022-12-16T17:09:30.267Z",                                    # update_at_message
    "messageData.mediaType":null,                                                          # type
    "messageData.mediaUrl":null,                                                           # media_link
    "messageData.ticketId":5
}

---------------------------------

Session

OUTBOUND -> FEZ DISPARO
MENSAGENS -> RESPONDER MSG DENTRO DE 24HORAS
INBOUND -> RESPONDER MSG DEPOIS DE 24HORAS

---------------------------------

Direction

incoming - Mensagem enviado pelo Cliente
outgoing_autoresponse - Mensagem automatica após primeira interação a cada 24hs
outgoing_template - Mensagem de envio de Boleto

---------------------------------
*/
