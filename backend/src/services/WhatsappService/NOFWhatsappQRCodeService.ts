import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Whatsapp from "../../database/models/Whatsapp";
import { getIO } from "../../libs/socket";

interface Request {
  result: number;
  session: string;
  qrcode: string;
}

interface Response {
  success: boolean;
}
const NOFWhatsappQRCodeService = async ({
  result,
  session,
  qrcode
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    result: Yup.number().required(),
    session: Yup.string().required(),
    qrcode: Yup.string().required()
  });

  try {
    await schema.validate({
      result,
      session,
      qrcode
    });
  } catch (err) {
    throw new AppError(err.message);
  }
  const whatsapp = await Whatsapp.findOne({
    where: {
      name: session
    }
  });

  if (!whatsapp) {
    return { success: false };
  }

  await whatsapp.update({
    status: "qrcode",
    qrcode
  });

  const io = getIO();
  io.emit("whatsappSession", {
    action: "update",
    session: whatsapp
  });

  return { success: true };
};

export default NOFWhatsappQRCodeService;
