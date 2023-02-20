import axios, { AxiosResponse } from "axios";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import AppError from "../../errors/AppError";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface TemplateData {
  header: string;
  mapping: string;
}

interface Request {
  templateId: string;
  companyId: number;
  templateBody: TemplateData;
}

const UpdateTemplateService = async ({
  templateBody,
  templateId,
  companyId
}: Request): Promise<OfficialTemplates> => {
  const template = await OfficialTemplates.findOne({
    where: {
      id: templateId,
      companyId
    }
  });

  const { header, mapping } = templateBody;

  await template.update({
    header,
    mapping
  });

  return template;
};

export default UpdateTemplateService;
