import Templates from "../../database/models/TemplatesData";

interface Request {
  name?: string;
  status?: number;
  text?: string;
  footer?: string;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}

const CreateTemplateDataService = async ({
  name,
  status,
  text,
  footer,
  companyId,
  createdAt,
  updatedAt
}: Request): Promise<Templates> => {
const templates = await Templates.create({
  name,
  status,
  text,
  footer,
  companyId,
  createdAt,
  updatedAt
});
  return templates.reload();
};

export default CreateTemplateDataService;
