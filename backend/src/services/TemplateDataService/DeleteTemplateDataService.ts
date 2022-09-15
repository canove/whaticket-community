import AppError from "../../errors/AppError";
import Templates from "../../database/models/TemplatesData";

const DeleteTemplateDataService = async (id: string | number): Promise<void> => {
  const templates = await Templates.findOne({
    where: { id }
  });

  if (!templates) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }


  await templates.destroy();
};

export default DeleteTemplateDataService;
