import * as Yup from "yup";
import Templates from "../../database/models/TemplatesData";
import AppError from "../../errors/AppError";
import ShowTemplateDataService from "./ShowTemplateDataService";

interface TemplatesData {
  name: string;
  text: string;
  footer: string;
}
interface Request {
  templatesData: TemplatesData;
  templatesId: string | number;
}

const UpdateTemplateDataService = async ({
  templatesData,
  templatesId
}: Request): Promise<Templates> => {
  const templates = await ShowTemplateDataService(templatesId);

  const { name, text, footer } = templatesData;

  await templates.update({
    name,
    text,
    footer
  });

  await templates.reload();

  return templates;
};

export default UpdateTemplateDataService;
