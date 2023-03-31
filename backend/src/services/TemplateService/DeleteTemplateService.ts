import axios, { AxiosResponse } from "axios";
import { Op } from "sequelize";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import OfficialTemplatesStatus from "../../database/models/OfficialTemplatesStatus";
import AppError from "../../errors/AppError";
import ShowOfficialWhatsappService from "../OfficialWhatsappServices/ShowOfficialWhatsappService";
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
  const officialWhatsapp = await ShowOfficialWhatsappService(whatsApp.officialWhatsappId, companyId);

  const { whatsappAccountId } = whatsApp;
  const { facebookAccessToken } = officialWhatsapp;

  try {
    const response = await axios.delete(
      `https://graph.facebook.com/v16.0/${whatsappAccountId}/message_templates?name=${templateName}&access_token=${facebookAccessToken}`
    );

    const templates = await OfficialTemplatesStatus.findAll({
      where: {
        whatsappId: whatsApp.id,
        [Op.or]: [
          { status: { [Op.ne]: "DELETED" } },
          { status: null }
        ],
      },
      include: [
        {
          model: OfficialTemplates,
          as: "officialTemplate",
          where: {
            name: templateName
          },
          required: true
        }
      ]
    });

    if (templates) {
      for (const template of templates) {
        await template.update({
          status: "DELETED",
          reason: "Template deleted in META."
        });
      }
    }

    return response.data;
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export default DeleteTemplateService;
