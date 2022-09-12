import Templates from "../../database/models/TemplatesData";

interface Request {
  name?: string;
  status?: number;
  text?: string;
  footer?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CreateTemplateDataService = async ({
  name,
  status,
  text,
  footer,
  createdAt,
  updatedAt
}: Request): Promise<Templates> => {
const templates = await Templates.create({
  name,
  status,
  text,
  footer,
  createdAt,
  updatedAt
});
  return templates.reload();
};

export default CreateTemplateDataService;
