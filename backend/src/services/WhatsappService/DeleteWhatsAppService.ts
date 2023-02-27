import axios from "axios";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import { logger } from "../../utils/logger";
/*eslint-disable*/
const DeleteWhatsAppService = async (id: string, companyId: string | number): Promise<void> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id, companyId }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await whatsapp.update({ status: "OPENING" });
  
  const io = getIO();
  io.emit(`whatsappSession${companyId}`, {
    action: "update",
    session: whatsapp
  });

  try {
    const apiUrl = `${process.env.WPPNOF_URL}/stop`;
    const payload = {
      session: whatsapp.name,
      companyId: whatsapp.companyId
    };

    await axios.post(apiUrl, payload, { headers: {
      "api-key": `${process.env.WPPNOF_API_TOKEN}`,
      "sessionkey": `${process.env.WPPNOF_SESSION_KEY}`
    }});
  } catch (err: any) {
    logger.error(err);
  }

  await whatsapp.update({
    deleted: true,
  });

  // await whatsapp.destroy();
};

export default DeleteWhatsAppService;
