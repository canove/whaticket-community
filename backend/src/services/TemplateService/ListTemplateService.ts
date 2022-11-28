import axios, { AxiosResponse } from "axios";
import AppError from "../../errors/AppError";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface Request {
  whatsAppId: string | number;
  companyId: string | number;
}

const ListTemplateService = async ({
  whatsAppId,
  companyId
}: Request): Promise<AxiosResponse> => {
  const whatsApp = await ShowWhatsAppService(whatsAppId, companyId);

  const { facebookAccessToken, whatsappAccountId } = whatsApp;

  try {
    const { data } = await axios.get(
      `https://graph.facebook.com/v13.0/${whatsappAccountId}/message_templates?access_token=${facebookAccessToken}&language=pt_BR`
    );

    return data.data;
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export default ListTemplateService;
