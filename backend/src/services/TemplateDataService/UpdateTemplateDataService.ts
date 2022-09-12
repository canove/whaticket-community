
import * as Yup from "yup";
import Templates from "../../database/models/TemplatesData";
import AppError from "../../errors/AppError";
import ShowTemplateDataService from "./ShowTemplateDataService";

interface TemplatesData {
  id: number;
  name?: string;
  status?: number;
  text?: string;
  footer?: string;
  createdAt?: Date;
  updatedAt?: Date;
  menusIds?: string;
}
interface Request {
  templatesData: TemplatesData;
  templatesId: string | number;
}
interface Response {

  name: string;
  status: number;
  text: string;
  footer: string;

}

const UpdateTemplateDataService = async ({
  templatesData,
  templatesId
}: Request): Promise<Response | Templates> => {
  const templates = await ShowTemplateDataService(templatesId);

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    id: Yup.number()
  });

  const {
    name,
    status,
    text,
    footer,

  } = templatesData;

  try {
    await schema.validate({
      name,
      status,
      text,
      footer,

    });
  } catch (err) {
    throw new AppError(err.message);
  }

  await templates.update({
    name,
    status,
    text,
    footer,

  });

  await templates.reload();

  const serializedTemplates = {
    id: templates.id,
    name: templates.name,
    status: templates.status,
    text: templates.text,
    footer: templates.footer,
    createdAt: templates.createdAt,
    updatedAt: templates.updatedAt,

  };

  return serializedTemplates;
};

export default UpdateTemplateDataService;
