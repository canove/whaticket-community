import OfficialTemplateStatus from "../../database/models/OfficialTemplatesStatus";
import Whatsapp from "../../database/models/Whatsapp";

interface Data {
  templateId: string | number;
  whatsappIds: number[] | string[];
  officialWhatsappId: string | number;
}

interface TemplateData {
  data: Data;
  companyId: string | number;
}

const BindTemplateService = async ({
  data,
  companyId,
}: TemplateData): Promise<void> => {
  const { whatsappIds, templateId, officialWhatsappId } = data;

  let whatsapps = null;

  if (whatsappIds[0] === "all") {
    whatsapps = await Whatsapp.findAll({
      where: {
        companyId,
        deleted: 0,
        officialWhatsappId
      }
    });
  } else {
    whatsapps = await Whatsapp.findAll({
      where: {
        id: whatsappIds,
        companyId,
        deleted: 0,
        officialWhatsappId
      }
    });
  }

  for (const whats of whatsapps) {
    await OfficialTemplateStatus.create({
      whatsappId: whats.id,
      officialTemplateId: templateId,
      companyId
    });
  }
};

export default BindTemplateService;
