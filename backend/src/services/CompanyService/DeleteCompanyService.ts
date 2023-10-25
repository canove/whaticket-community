import Company from "../../models/Company";
import AppError from "../../errors/AppError";

const DeleteCompanyService = async (id: string): Promise<void> => {
  const company = await Company.findOne({
    where: { id }
  });

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  await company.destroy();
};

export default DeleteCompanyService;
