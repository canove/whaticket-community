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
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This whatsapp name is already used.",
        async value => {
          if (value) {
            const whatsappFound = await Whatsapp.findOne({
              where: { name: value }
            });
            return !whatsappFound;
          }
          return true;
        }
      ),
    isDefault: Yup.boolean()
      .required()
      .test(
        "Check-default",
        "Only one default whatsapp is permitted",
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
