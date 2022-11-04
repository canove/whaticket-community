import * as Yup from "yup";
import { Op } from "sequelize";

import AppError from "../../errors/AppError";
import Whatsapp from "../../database/models/Whatsapp";
import ShowWhatsAppService from "./ShowWhatsAppService";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";

interface WhatsappData {
  name?: string;
  status?: string;
  session?: string;
  isDefault?: boolean;
  greetingMessage?: string;
  farewellMessage?: string;
  queueIds?: number[];
  official?: boolean;
  facebookToken?: string;
  facebookBusinessId?: string;
  facebookPhoneNumberId?: string;
  phoneNumber?: string;
  flowId?: string | number;
  connectionFileId?: string | number;
  business?: boolean;
}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
  companyId: string | number;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const UpdateWhatsAppService = async ({
  whatsappData,
  whatsappId,
  companyId
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    status: Yup.string(),
    isDefault: Yup.boolean()
  });

  const {
    name,
    status,
    isDefault,
    session,
    greetingMessage,
    farewellMessage,
    queueIds = [],
    official,
    facebookToken,
    facebookPhoneNumberId,
    facebookBusinessId,
    phoneNumber,
    flowId,
    connectionFileId,
    business,
  } = whatsappData;

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (queueIds.length > 1 && !greetingMessage) {
    throw new AppError("ERR_WAPP_GREETING_REQUIRED");
  }

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: true, id: { [Op.not]: whatsappId }, companyId }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  if (!official && (facebookToken || facebookPhoneNumberId || phoneNumber)) {
    throw new AppError("ERRO!");
  }

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  await whatsapp.update({
    name,
    status,
    session,
    greetingMessage,
    farewellMessage,
    isDefault,
    official,
    facebookToken,
    facebookPhoneNumberId,
    facebookBusinessId,
    phoneNumber,
    flowId,
    connectionFileId,
    business,
  });

  await AssociateWhatsappQueue(whatsapp, queueIds);

  return { whatsapp, oldDefaultWhatsapp };
};

export default UpdateWhatsAppService;
