import axios from "axios";
import AppError from "../../errors/AppError";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface TemplateData {
  templateName: string;
  category: string;
  whatsAppsId: string[] | number[];
  bodyText: string;
  footerText: string;
  companyId: string | number;
}

const CreateTemplateService = async ({
  templateName,
  category,
  whatsAppsId,
  bodyText,
  footerText,
  companyId
}: TemplateData): Promise<void> => {
  whatsAppsId.forEach(async whatsAppId => {
    const whatsApp = await ShowWhatsAppService(whatsAppId, companyId);

    if (!whatsApp) {
      throw new AppError(`ERR_NO_WHATSAPP_WITH_ID_${whatsAppId}`, 404);
    }
    const { facebookAccessToken, whatsappAccountId } = whatsApp;

    if (category === "transicional") {
      category = "TRANSACTIONAL";
    }

    if (category === "marketing") {
      category = "MARKETING";
    }

    try {
      const response = await axios.post(
        `https://graph.facebook.com/v13.0/${whatsappAccountId}/message_templates?name=${templateName}&language=pt_BR&category=${category}&access_token=${facebookAccessToken}`,
        {
          components: [
            {
              type: "BODY",
              text: bodyText
            },
            {
              type: "FOOTER",
              text: footerText
            }
          ]
        }
      );

      return response;
    } catch (err: any) {
      throw new AppError(err);
    }
  });
};

export default CreateTemplateService;
