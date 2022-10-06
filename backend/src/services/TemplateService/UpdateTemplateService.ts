import axios, { AxiosResponse } from "axios";
import AppError from "../../errors/AppError";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface TemplateData {
  templateName: string;
  category: string;
  whatsAppId: string | number;
  bodyText: string;
  footerText: string;
  templateId: string | number;
  companyId: string | number;
}

const UpdateTemplateService = async ({
  templateName,
  category,
  whatsAppId,
  bodyText,
  footerText,
  templateId,
  companyId
}: TemplateData): Promise<AxiosResponse> => {
  const whatsApp = await ShowWhatsAppService(whatsAppId, companyId);

  const { facebookToken } = whatsApp;

  try {
    const response = await axios.post(
      `https://graph.facebook.com/v13.0/${templateId}?name=${templateName}&language=pt_BR&category=${category}&access_token=${facebookToken}`,
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
};

export default UpdateTemplateService;
