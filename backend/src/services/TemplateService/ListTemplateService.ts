import axios, { AxiosResponse } from "axios";
import { Op } from "sequelize";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import AppError from "../../errors/AppError";
import ShowOfficialWhatsappService from "../OfficialWhatsappServices/ShowOfficialWhatsappService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import OfficialTemplatesStatus from "../../database/models/OfficialTemplatesStatus";

interface Request {
  companyId: string | number;
  whatsappId?: string;
}

const ListMetaTemplateService = async ({
  companyId,
  whatsappId
}: Request): Promise<OfficialTemplates[]> => {
  let includeCondition = null;

  if (whatsappId) {
    includeCondition = [
      {
        model: OfficialTemplatesStatus,
        as: "officialTemplatesStatus",
        where: { status: "APPROVED", whatsappId },
        required: true
      }
    ];
  }

  const templates = await OfficialTemplates.findAll({
    where: { companyId, deletedAt: null },
    include: includeCondition
  });

  return templates;
};

export default ListMetaTemplateService;
