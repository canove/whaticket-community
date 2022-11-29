import axios, { AxiosResponse } from "axios";
import AppError from "../../errors/AppError";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface Request {
  whatsAppId: string | number;
  templateName: string;
  companyId: string | number;
}

const DeleteTemplateService = async ({
  whatsAppId,
  templateName,
  companyId
}: Request): Promise<AxiosResponse> => {
  const whatsApp = await ShowWhatsAppService(whatsAppId, companyId);

  const { whatsappAccountId, facebookAccessToken } = whatsApp;

  try {
    const response = await axios.delete(
      `https://graph.facebook.com/v13.0/${whatsappAccountId}/message_templates?name=${templateName}&access_token=${facebookAccessToken}`
    );

    return response.data;
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export default DeleteTemplateService;
