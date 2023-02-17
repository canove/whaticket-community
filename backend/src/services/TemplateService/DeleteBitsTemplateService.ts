import axios, { AxiosResponse } from "axios";
import { Op } from "sequelize";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import OfficialTemplatesStatus from "../../database/models/OfficialTemplatesStatus";
import AppError from "../../errors/AppError";
import ShowOfficialWhatsappService from "../OfficialWhatsappServices/ShowOfficialWhatsappService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface Request {
  officialTemplateId: string;
  companyId: number;
}

const DeleteBitsTemplateService = async ({
  officialTemplateId,
  companyId
}: Request): Promise<void> => {
  const template = await OfficialTemplates.findOne({
    where: { 
      id: officialTemplateId, 
      companyId, 
      deletedAt: null 
    },
    include: [
      {
        model: OfficialTemplatesStatus,
        as: "officialTemplatesStatus",
        where: {
          officialTemplateId: officialTemplateId,
          [Op.or]: [
            { status: { [Op.ne]: "DELETED" } },
            { status: null }
          ],
        },
        required: false
      }
    ]
  });

  if (!template) throw new AppError("ERR_TEMPLATE_DO_NOT_EXISTS");

  const templatesStatuses = template.officialTemplatesStatus || [];

  for (const templateStatus of templatesStatuses) {
    await templateStatus.update({
      status: "DELETED",
      reason: "Template deleted in BITS."
    });
  }

  await template.update({ deletedAt: new Date() });
};

export default DeleteBitsTemplateService;
