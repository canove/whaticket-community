import FileRegister from "../../database/models/FileRegister";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  companyId: number;
  limit: string;
  pageNumber: string;
}

interface Response {
  reports: FileRegister[];
  count: number;
}

const ListOfficialWhatsappService = async ({
  companyId,
  limit = "10",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const offset = +limit * (+pageNumber - 1);

  const { count, rows: reports } = await FileRegister.findAndCountAll({
    where: { companyId },
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
      {
        model: Message,
        as: "messageData",
        attributes: [
          "body",
          "createdAt",
          "updatedAt",
          "mediaType",
          "mediaUrl",
          "ticketId"
        ],
        required: true
      }
    ],
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? offset : null,
  });

//   for (const report of reports) {
//     const myLastMessage = await Message.findOne({
//         where: { ticketId: report.messageData.ticketId, fromMe: true },
//         order: [["createdAt", "DESC"]],
//     });

//     const clientLastMessage = await Message.findOne({
//         where: { ticketId: report.messageData.ticketId, fromMe: false },
//         order: [["createdAt", "DESC"]],
//     })

//     const in24Hours = (myLastMessage.createdAt.getTime() - clientLastMessage.createdAt.getTime()) < 86400000;

//     console.log(in24Hours);
//   }

  return { reports, count };
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
