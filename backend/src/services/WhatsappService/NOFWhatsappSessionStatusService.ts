import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Whatsapp from "../../database/models/Whatsapp";
import { getIO } from "../../libs/socket";
/*eslint-disable*/
interface Request {
  session: string;
  status: string;
}

interface Response {
  success: boolean;
}
const NOFWhatsappSessionStatusService = async ({
  session,
  status
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    session: Yup.string().required(),
    status: Yup.string().required()
  });

  try {
    await schema.validate({
      session,
      status
    });
  } catch (err) {
    throw new AppError(err.message);
  }
  const whatsapp = await Whatsapp.findOne({
    where: {
      name: session,
      deleted: false
    }
  });

  if (!whatsapp) {
    return { success: false };
  }

  switch(status){
    case "connected":
      await whatsapp.update({
        status: "CONNECTED"
      });
      break;
    case "disconnectedMobile":
      await whatsapp.update({
        status: "DISCONNECTED",
        qrcode: null
      });
      break;
     case "notLogged":
        await whatsapp.update({
          status: "DISCONNECTED",
          qrcode: null
        });
      break;
      case "autocloseCalled":
        await whatsapp.update({
          status: "TIMEOUT",
          qrcode: null
        });
      break;
  }
  
  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });
  
  return { success: true };
};

export default NOFWhatsappSessionStatusService;
