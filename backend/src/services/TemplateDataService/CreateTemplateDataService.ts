import Templates from "../../database/models/TemplatesData";

interface Body {
  type: string;
  value: string;
}
interface Request {
  name: string;
  text: Body[];
  footer: string;
  companyId: number;
}

const CreateTemplateDataService = async ({
  name,
  text,
  footer,
  companyId
}: Request): Promise<Templates> => {
  const body = JSON.stringify(text);

  const templates = await Templates.create({
    name,
    text: body,
    footer,
    companyId
  });

  await templates.reload();

  return templates;
};

export default CreateTemplateDataService;
