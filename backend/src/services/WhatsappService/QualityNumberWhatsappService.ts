import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  displayPhoneNumber: string;
  event: string;
  currentLimit: string;
}

interface Response {
  success: boolean;
}
const QualityNumberWhatsappService = async ({
  displayPhoneNumber,
  event,
  currentLimit
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    displayPhoneNumber: Yup.string().required(),
    event: Yup.string().required(),
    currentLimit: Yup.string().required()
  });

  try {
    await schema.validate({
      displayPhoneNumber,
      event,
      currentLimit
    });
  } catch (err) {
    throw new AppError(err.message);
  }
  const whatsapp = await Whatsapp.findOne({
    where: {
      phoneNumber: displayPhoneNumber
    }
  });

  if (!whatsapp) {
    return { success: false };
  }
  console.log("update whatsapp qualitynumber 43");
  await whatsapp.update({
    tierLimit: currentLimit,
    quality: event
  });

  return { success: true };
};

export default QualityNumberWhatsappService;
