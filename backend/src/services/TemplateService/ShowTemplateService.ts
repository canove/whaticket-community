import axios, { AxiosResponse } from "axios";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import OfficialTemplatesStatus from "../../database/models/OfficialTemplatesStatus";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import ShowOfficialWhatsappService from "../OfficialWhatsappServices/ShowOfficialWhatsappService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface Request {
  companyId: number;
  templateId: string
}

const ShowTemplateService = async ({
  companyId,
  templateId
}: Request): Promise<OfficialTemplates> => {
    const template = await OfficialTemplates.findOne({
        where: { companyId, id: templateId },
        include: [
          {
            model: OfficialTemplatesStatus,
            as: "officialTemplatesStatus",
            attributes: ["id"],
            required: false,
            where: {
              status: "APPROVED"
            },
            include: [
              {
                model: Whatsapp,
                as: "whatsapp",
                attributes: ["name"],
                required: false,
              }
            ]
          }
        ]
    });

    return template;
};

export default ShowTemplateService;
