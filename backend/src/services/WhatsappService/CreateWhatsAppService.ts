import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Whatsapp from "../../database/models/Whatsapp";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";
import { faBusinessTime } from "@fortawesome/free-solid-svg-icons";
import { createClient } from "redis";

interface Request {
  name: string;
  queueIds?: number[];
  greetingMessage?: string;
  farewellMessage?: string;
  status?: string;
  isDefault?: boolean;
  official?: boolean;
  facebookToken?: string;
  facebookPhoneNumberId?: string;
  facebookBusinessId?: string;
  phoneNumber?: string;
  companyId?: string | number;
  flowId?: string | number;
  connectionFileId?: string | number;
  business?: boolean;
  facebookAccessToken?: string;
  whatsappAccountId?: string;
  officialConnectionId?: string;
  messageCallbackUrl?: string;
  statusCallbackUrl?: string;
  callbackAuthorization?: string;
  useGroup?: boolean;
}

interface Response {
  whatsapp: Whatsapp;
  oldDefaultWhatsapp: Whatsapp | null;
}

const CreateWhatsAppService = async ({
  name,
  status = "OPENING",
  queueIds = [],
  greetingMessage,
  farewellMessage,
  isDefault = false,
  official,
  facebookAccessToken,
  whatsappAccountId,
  facebookToken,
  facebookPhoneNumberId,
  facebookBusinessId,
  phoneNumber,
  companyId,
  flowId,
  connectionFileId,
  business = false,
  officialConnectionId,
  messageCallbackUrl,
  statusCallbackUrl,
  callbackAuthorization,
  useGroup
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This whatsapp name is already used.",
        async value => {
          if (!value) return false;
          const nameExists = await Whatsapp.findOne({
            where: { name: value, companyId, deleted: false }
          });
          return !nameExists;
        }
      ),
    // isDefault: Yup.boolean().required()
  });

  try {
    await schema.validate({ name, status, isDefault });
  } catch (err:any) {
    throw new AppError(err.message);
  }

  const whatsappFound = await Whatsapp.findOne();

  isDefault = !whatsappFound;

  let oldDefaultWhatsapp: Whatsapp | null = null;

  if (isDefault) {
    oldDefaultWhatsapp = await Whatsapp.findOne({
      where: { isDefault: true, companyId }
    });
    if (oldDefaultWhatsapp) {
      await oldDefaultWhatsapp.update({ isDefault: false });
    }
  }

  if (queueIds.length > 1) {
    throw new AppError("ERR_DOUBLE_QUEUES");
  }

  if (!official && (facebookToken || facebookPhoneNumberId || phoneNumber)) {
    throw new AppError("ERRO!");
  }
  const lastPingDate = new Date();

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

  const whatsapp = await Whatsapp.create(
    {
      name,
      status,
      // greetingMessage,
      // farewellMessage,
      isDefault,
      official,
      facebookToken,
      facebookPhoneNumberId,
      facebookBusinessId,
      phoneNumber,
      lastPingDate,
      companyId,
      flowId,
      connectionFileId,
      faBusinessTime,
      business,
      facebookAccessToken,
      whatsappAccountId,
      officialWhatsappId: officialConnectionId,
      usedLimit: official ? 0 : null,
      messageCallbackUrl,
      statusCallbackUrl,
      callbackAuthorization,
      useGroup
    },
    { include: ["queues"] }
  );

  await AssociateWhatsappQueue(whatsapp, queueIds);

  return { whatsapp, oldDefaultWhatsapp };
};

export default CreateWhatsAppService;
