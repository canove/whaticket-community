import * as Yup from "yup";
import { Op } from "sequelize";

import AppError from "../../errors/AppError";
import Whatsapp from "../../database/models/Whatsapp";
import ShowWhatsAppService from "./ShowWhatsAppService";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";
import { createClient } from "redis";

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
  facebookAccessToken?: string,
  whatsappAccountId?: string
  messageCallbackUrl?: string;
  statusCallbackUrl?: string;
  callbackAuthorization?: string;
  useGroup?: boolean;
}

interface Request {
  whatsappData: WhatsappData;
  whatsappId: string;
  companyId: string | number;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
  isConnectionFileIdChanged: boolean;
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
    facebookAccessToken,
    whatsappAccountId,
    messageCallbackUrl,
    statusCallbackUrl,
    callbackAuthorization,
    useGroup
  } = whatsappData;

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (queueIds.length > 1) {
    throw new AppError("ERR_DOUBLE_QUEUES");
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

  try {
    const client = createClient({
      url: process.env.REDIS_URL
    });
    
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();

    if (useGroup === true) {
      await client.set(`${name}-group`, "true");
    } else {
      const exists = await client.get(`${name}-group`);
  
      if (exists) await client.del(`${name}-group`);
    }

    await client.disconnect();
  } catch (err: any) {
    throw new AppError(err);
  }

  const isConnectionFileIdChanged = whatsapp.connectionFileId != connectionFileId;

  await whatsapp.update({
    name,
    status,
    session,
    // greetingMessage,
    // farewellMessage,
    isDefault,
    official,
    facebookToken,
    facebookPhoneNumberId,
    facebookBusinessId,
    phoneNumber,
    flowId,
    connectionFileId,
    business,
    facebookAccessToken,
    whatsappAccountId,
    messageCallbackUrl,
    statusCallbackUrl,
    callbackAuthorization,
    useGroup
  });

  await AssociateWhatsappQueue(whatsapp, queueIds);

  return { whatsapp, oldDefaultWhatsapp, isConnectionFileIdChanged };
};

export default UpdateWhatsAppService;
