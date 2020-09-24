import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";

interface WhatsappData {
  name?: string;
  status?: string;
  isDefault?: boolean;
}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
}

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId
}: Request): Promise<Whatsapp> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    default: Yup.boolean().test(
      "Check-default",
      "Only one default whatsapp is permited",
      async value => {
        if (value === true) {
          const whatsappFound = await Whatsapp.findOne({
            where: { default: true }
          });
          if (whatsappFound) {
            return !(whatsappFound.id !== +whatsappId);
          }
          return true;
        }
        return true;
      }
    )
  });

  const { name, status, isDefault } = whatsappData;

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err) {
    throw new AppError(err.message);
  }

  const whatsapp = await Whatsapp.findOne({
    where: { id: whatsappId }
  });

  if (!whatsapp) {
    throw new AppError("No whatsapp found with this ID.", 404);
  }

  await whatsapp.update({
    name,
    status,
    isDefault
  });

  return whatsapp;
};

export default UpdateWhatsAppService;
