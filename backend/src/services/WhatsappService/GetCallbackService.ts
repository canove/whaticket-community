import { Op } from "sequelize";
import Whatsapp from "../../database/models/Whatsapp";

interface Response {
  messageCallbackUrl: string;
  statusCallbackUrl: string;
  callbackAuthorization: string;
  companyId: number;
}

const GetCallbackService = async (
  session: string
): Promise<Response> => {
  const whatsapp = await Whatsapp.findOne({
    attributes: ["messageCallbackUrl", "statusCallbackUrl", "callbackAuthorization", "companyId"],
    where: {
      [Op.or]: [
        { name: session },
        { facebookPhoneNumberId: session }
      ],
      deleted: false
    },
    order: [["createdAt", "DESC"]]
  });

  if (!whatsapp) return null;

  const callback = {
    messageCallbackUrl: whatsapp.messageCallbackUrl,
    statusCallbackUrl: whatsapp.statusCallbackUrl,
    callbackAuthorization: whatsapp.callbackAuthorization,
    companyId: whatsapp.companyId
  };

  return callback;
};

export default GetCallbackService;
