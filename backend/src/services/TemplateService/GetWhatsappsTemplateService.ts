import axios, { AxiosResponse } from "axios";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import OfficialTemplatesStatus from "../../database/models/OfficialTemplatesStatus";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import ShowOfficialWhatsappService from "../OfficialWhatsappServices/ShowOfficialWhatsappService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface Request {
  companyId: string | number;
  templateId: string | number;
}

interface Response {
    whatsappId: string | number;
}

const GetWhatsappsTemplateService = async ({
  companyId,
  templateId
}: Request): Promise<Response[]> => {
    const whatsapps = await OfficialTemplatesStatus.findAll({
        where: {
            officialTemplateId: templateId,
            status: "APPROVED",
            companyId,
        },
        attributes: [
            "whatsappId",
        ],
        include: [{
            model: Whatsapp,
            attributes: ["name"],
            where: { deleted: false }
        }],
        raw: true
    });

    return whatsapps;
};

export default GetWhatsappsTemplateService;
