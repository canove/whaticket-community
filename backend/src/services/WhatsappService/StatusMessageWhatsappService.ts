import * as Yup from "yup";
import AppError from "../../errors/AppError";
import FileRegister from "../../database/models/FileRegister";
import { FileStatus } from "../../enum/FileStatus";
import File from "../../database/models/File";
import Message from "../../database/models/Message";

interface Request {
  msgId: number;
  statusType: string;
  msgWhatsId?: string;
}

interface Response {
  success: boolean;
}
const StatusMessageWhatsappService = async ({
  msgId,
  statusType,
  msgWhatsId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    statusType: Yup.string().required()
  });

  try {
    await schema.validate({
      statusType,
      msgId
    });
  } catch (err) {
    throw new AppError(err.message);
  }
  let register;

  if (msgId) {
    register = await FileRegister.findOne({
      where: {
        id: msgId
      }
    });
  } 

  if ((msgId == null || msgId === undefined) && msgWhatsId) {
    register = await FileRegister.findOne({
      where: {
        msgWhatsId
      }
    });
  }

  if (!register && msgWhatsId) {
    const msgRegister = await Message.findOne({
      where: {
        id: msgWhatsId
      }
    });

   if (msgRegister) {
    switch(statusType){
      case "sent":
        await msgRegister?.update({ ack: 1 });
        break;
      case "delivered":
        await msgRegister?.update({ ack: 2 });
        break;
      case "read":
        await msgRegister?.update({ ack:3, read: 1 });
        break;
    }

    return { success: true }
   }
  }


  if (!register) {
    return { success: false };
  }

  switch(statusType){
    case "sent":
      await register?.update({ sentAt: new Date(), msgWhatsId: msgWhatsId });
      break;
    case "delivered":
      await register?.update({ deliveredAt: new Date() });
      break;
    case "read":
      await register?.update({ readAt: new Date() });
      break;
  }

  var registersCount = await FileRegister.count({
    where: {
      fileId: register?.fileId,
      sentAt: null
    }
  });
  
  if (registersCount == 0) {
    const file = await File.findOne({
        where: {
          id: register?.fileId
        }
    })
    await file.update({ Status: FileStatus.Finished });
  }

  return { success: true };
};

export default StatusMessageWhatsappService;
