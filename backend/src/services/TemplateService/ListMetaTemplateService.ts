import axios, { AxiosResponse } from "axios";
import AppError from "../../errors/AppError";
import ShowOfficialWhatsappService from "../OfficialWhatsappServices/ShowOfficialWhatsappService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface Request {
  whatsAppId: string | number;
  companyId: string | number;
}

const ListMetaTemplateService = async ({
  whatsAppId,
  companyId
}: Request): Promise<AxiosResponse> => {
  const whatsApp = await ShowWhatsAppService(whatsAppId, companyId);
  const officialWhatsapp = await ShowOfficialWhatsappService(whatsApp.officialWhatsappId, companyId);

  const { whatsappAccountId } = whatsApp;
  const { facebookAccessToken } = officialWhatsapp;

  try {
    const { data } = await axios.get(
      `https://graph.facebook.com/v13.0/${whatsappAccountId}/message_templates?access_token=${facebookAccessToken}&language=pt_BR`
    );

    return data.data;
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export default ListMetaTemplateService;
