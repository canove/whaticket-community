import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import AssociateWhatsappQueue from "../QueueService/AssociateWhatsappQueue";

interface QueueData {
  id: number;
  optionNumber: number;
}
interface Request {
  name: string;
  queuesData: QueueData[];
  greetingMessage?: string;
  status?: string;
  isDefault?: boolean;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const CreateWhatsAppService = async ({
  name,
  status = "OPENING",
  queuesData = [],
  greetingMessage,
  isDefault = false
}: Request): Promise<Response> => {
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
    isDefault: Yup.boolean().required()
  });

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err) {
    throw new AppError(err.message);
  }

  const whatsappFound = await Whatsapp.findOne();

  if (!whatsappFound) {
    isDefault = !whatsappFound;
  }

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: true }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  const whatsapp = await Whatsapp.create(
    {
      name,
      status,
      greetingMessage,
      isDefault
    },
    { include: ["queues"] }
  );

  await AssociateWhatsappQueue(whatsapp, queuesData);

  await whatsapp.reload();

  return { whatsapp, oldDefaultWhatsapp };
};

export default CreateWhatsAppService;
