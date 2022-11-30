import axios, { AxiosResponse } from "axios";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import AppError from "../../errors/AppError";
import ShowOfficialWhatsappService from "../OfficialWhatsappServices/ShowOfficialWhatsappService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface Request {
  companyId: string | number;
}

const ListMetaTemplateService = async ({
  companyId
}: Request): Promise<OfficialTemplates[]> => {
    const templates = await OfficialTemplates.findAll({
        where: { companyId }
    });

    return templates;
};

export default ListMetaTemplateService;
