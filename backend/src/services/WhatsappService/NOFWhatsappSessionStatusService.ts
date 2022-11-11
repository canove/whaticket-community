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

  var dif = new Date().getTime() - whatsapp.updatedAt.getTime();

  var Seconds_from_T1_to_T2 = dif / 1000;
  var Seconds_Between_Dates = Math.abs(Seconds_from_T1_to_T2);

  if(whatsapp.status == 'CONNECTED' && Seconds_Between_Dates < 60) {
    return { success: false };
  }

  switch(status){
    case "isLogged":
    case "connected":
      await whatsapp.update({
        status: "CONNECTED"
      });
      break;
    case "disconnectedMobile":
    case "notLogged":
    case "autocloseCalled":
      await whatsapp.update({
        status: "DISCONNECTED",
        qrcode: null
      });
    break;
    case "OPENING":
      await whatsapp.update({
        status: "OPENING",
        qrcode: null
      });
    break;
    default:
      await whatsapp.update({
        status: "DISCONNECTED",
        qrcode: null
      });
  }
  
  const io = getIO();
  io.emit(`whatsappSession${whatsapp.companyId}`, {
    action: "update",
    session: whatsapp
  });
  
  return { success: true };
};

export default NOFWhatsappSessionStatusService;
