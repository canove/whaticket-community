import axios from "axios";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import OfficialTemplatesStatus from "../../database/models/OfficialTemplatesStatus";
import AppError from "../../errors/AppError";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

interface MetaComponent {
  type?: string;
  text?: string;
  format?: string;
}

interface MetaTemplate {
  name: string;
  status: string;
  id: string;
  components: MetaComponent[];
  category: string;
}

interface TemplateData {
  officialTemplate: MetaTemplate;
  mapping: string;
  headerVar: string;
  whatsappId: string;
  companyId: string | number;
  documentName?: string
}

const CreateOfficialTemplateService = async ({
  officialTemplate,
  mapping,
  headerVar,
  whatsappId,
  companyId,
  documentName
}: TemplateData): Promise<OfficialTemplates> => {
  const templateExists = await OfficialTemplatesStatus.findOne({
    where: {
      status: "APPROVED",
      facebookTemplateId: officialTemplate.id,
      companyId
    },
  });

  if (templateExists) throw new AppError("TEMPLATE_ALREADY_EXISTS");

  const getTemplateComponent = (components, type, item) => {
    const component = components.find(component => component.type === type);

    if (item === "text") return component ? component.text : null;
    if (item === "format") return component ? component.format : "";
    if (item === "buttons") return component ? component.buttons : null;
  };

  const { name, components, category } = officialTemplate;

  const headerFormat = getTemplateComponent(components, "HEADER", "format");
  const bodyText = getTemplateComponent(components, "BODY", "text");
  const footerText = getTemplateComponent(components, "FOOTER", "text");
  const buttons = getTemplateComponent(components, "BUTTONS", "buttons");

  let headerObj = null;
  if (headerFormat && headerVar) {
    headerObj = {
      format: headerFormat,
      link: headerVar,
      documentName: (headerFormat === "DOCUMENT" && documentName) ? documentName : null
    };
  }

  const template = await OfficialTemplates.create({
    name,
    category: category.toLowerCase(),
    header: headerObj ? JSON.stringify(headerObj) : null,
    body: bodyText,
    footer: footerText,
    mapping: JSON.stringify(mapping),
    companyId,
    buttons: buttons ? JSON.stringify(buttons) : null
  });

  await OfficialTemplatesStatus.create({
    status: officialTemplate.status,
    facebookTemplateId: officialTemplate.id,
    whatsappId,
    officialTemplateId: template.id,
    companyId,
    processedAt: new Date()
  });

  return template;
};

export default CreateOfficialTemplateService;
