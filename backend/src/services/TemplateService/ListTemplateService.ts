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

  const { facebookBusinessId } = whatsApp;
  const { facebookToken } = whatsApp;

  try {
    const response = await axios.get(
      `https://graph.facebook.com/v13.0/${facebookBusinessId}/message_templates?access_token=${facebookToken}&language=pt_BR`
    );

    return response.data.data;
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export default ListTemplateService;
