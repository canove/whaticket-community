import axios from "axios";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import AppError from "../../errors/AppError";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface TemplateData {
  name: string;
  footerText: string;
  category: string;
  bodyText: string;
  mapping: string;
  companyId: string | number;
}

const CreateTemplateService = async ({
  name,
  footerText,
  category,
  bodyText,
  mapping,
  companyId
}: TemplateData): Promise<OfficialTemplates> => {
  const templateExists = await OfficialTemplates.findOne({
    where: {
      name,
      companyId
    }
  });

  if (templateExists) throw new AppError("TEMPLATE_ALREADY_EXISTS");

  const template = await OfficialTemplates.create({
    name,
    footer: footerText,
    category,
    body: bodyText,
    mapping,
    companyId
  });

  return template;

  // whatsAppsId.forEach(async whatsAppId => {
  //   const whatsApp = await ShowWhatsAppService(whatsAppId, companyId);

  //   if (!whatsApp) {
  //     throw new AppError(`ERR_NO_WHATSAPP_WITH_ID_${whatsAppId}`, 404);
  //   }
  //   const { facebookAccessToken, whatsappAccountId } = whatsApp;

  //   if (category === "transicional") {
  //     category = "TRANSACTIONAL";
  //   }

  //   if (category === "marketing") {
  //     category = "MARKETING";
  //   }

  //   try {
  //     const response = await axios.post(
  //       `https://graph.facebook.com/v13.0/${whatsappAccountId}/message_templates?name=${templateName}&language=pt_BR&category=${category}&access_token=${facebookAccessToken}`,
  //       {
  //         components: [
  //           {
  //             type: "BODY",
  //             text: bodyText
  //           },
  //           {
  //             type: "FOOTER",
  //             text: footerText
  //           }
  //         ]
  //       }
  //     );

  //     return response;
  //   } catch (err: any) {
  //     throw new AppError(err);
  //   }
  // });
};

export default CreateTemplateService;
