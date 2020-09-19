import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  name: string;
  status?: string;
  isDefault?: boolean;
}

const CreateWhatsAppService = async ({
  name,
  status = "INITIALIZING",
  isDefault = false
}: Request): Promise<Whatsapp> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    isDefault: Yup.boolean()
      .required()
      .test(
        "Check-default",
        "Only one default whatsapp is permited",
        async value => {
          if (value === true) {
            const whatsappFound = await Whatsapp.findOne({
              where: { isDefault: true }
            });
            return !whatsappFound;
          }
          return true;
        }
      )
  });

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err) {
    throw new AppError(err.message);
  }

  const whatsapp = await Whatsapp.create({
    name,
    status,
    isDefault
  });

  return whatsapp;
};

export default CreateWhatsAppService;
