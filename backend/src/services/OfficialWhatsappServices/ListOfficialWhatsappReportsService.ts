import FileRegister from "../../database/models/FileRegister";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import Whatsapp from "../../database/models/Whatsapp";
import { subHours } from "date-fns";
import { Op } from "sequelize";

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
}

interface Response {
  reports: OfficialReport[];
  count: number;
}

const ListOfficialWhatsappService = async ({
  companyId,
  limit = "10",
  pageNumber = "1"
}: Request): Promise<Response> => {
  let reports = [];
  
  const offset = +limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    include: [
      {
        model: Ticket,
        as: "ticket",
        attributes: ["id"],
        where: { companyId }
      }
    ],
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? offset : null,
  });

  for (const message of messages) {
    let report = null;

    let direction = "incoming";
    let session = "inbound";

    const id_session = message.id;
    const content = message.body;
    const type = message.mediaType;
    const media_link = message.mediaUrl;
    const create_at_message = message.createdAt;
    const update_at_message = message.updatedAt;

    report = {
      id_session,
      content,
      type,
      media_link,
      create_at_message,
      update_at_message
    };

    const messageIn24Hours = await Message.findOne({
      where: {
        id: { [Op.ne]: message.id },
        createdAt: { [Op.between]: [+subHours(new Date(), 24), +new Date()] }
      }
    });

    if (messageIn24Hours) {
      session = "messages";
    }

    const fileRegister = await FileRegister.findOne({
      attributes: [
        "msgWhatsId",
        "var1",
        "var2",
        "var3",
        "var4",
        "var5",
        "whatsappId",
        "phoneNumber",
        "createdAt",
        "updatedAt",
        "id",
        "readAt",
        "deliveredAt",
        "sentAt",
        "errorAt"
      ],
      include: [
        {
          model: Whatsapp,
          as: "whatsapp",
          attributes: ["name"],
          required: true
        },
      ],
      where: { msgWhatsId: message.id }
    });

    if (fileRegister) {
      direction = "outgoing_template";
      session = "outbound";

      const external_id = fileRegister.id;
      const client_phone_number = fileRegister.phoneNumber;
      const var1 = fileRegister.var1;
      const var2 = fileRegister.var2;
      const var3 = fileRegister.var3;
      const var4 = fileRegister.var4;
      const var5 = fileRegister.var5;
      const create_at_session = fileRegister.createdAt;
      const update_at_session = fileRegister.updatedAt;
      
      const phone_number = fileRegister.whatsapp.name;
      const status = getStatus(fileRegister);

      report = {
        ...report,
        external_id,
        client_phone_number,
        var1,
        var2,
        var3,
        var4,
        var5,
        create_at_session,
        update_at_session,
        status,
        phone_number
      }
    };

    report = {
      ...report,
      direction,
      session,
      destination_number_type: "MOBILE"
    }

    reports.push(report);
  }

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
