import AppError from "../../errors/AppError";
import Templates from "../../database/models/TemplatesData";

const ShowTemplateDataService = async (id: string | number): Promise<Templates> => {
  const templates = await Templates.findByPk(id, {
    attributes: ["id", "name", "status", "text", "footer", "createdAt", "updatedAt"],

  });
  if (!templates) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  return templates;
};

export default ShowTemplateDataService;
