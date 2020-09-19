import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";

interface Request {
  name: string;
  status?: string;
}

const CreateWhatsAppService = async ({
  name,
  status = "INITIALIZING"
}: Request): Promise<Whatsapp> => {
  // const schema = Yup.object().shape({
  //   name: Yup.string().required().min(2),
  //   default: Yup.boolean()
  //     .required()
  //     .test(
  //       "Check-default",
  //       "Only one default whatsapp is permited",
  //       async value => {
  //         if (value === true) {
  //           const whatsappFound = await Whatsapp.findOne({
  //             where: { default: true }
  //           });
  //           return !Boolean(whatsappFound);
  //         } else return true;
  //       }
  //     )
  // });

  // try {
  //   await schema.validate({ name, status });
  // } catch (err) {
  //   throw new AppError(err.message);
  // }

  const whatsapp = await Whatsapp.create({
    name,
    status
  });

  return whatsapp;
};

export default CreateWhatsAppService;
