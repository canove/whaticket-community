import AppError from "../../errors/AppError";
import Company from "../../database/models/Company";

const DeleteCompanyService = async (id: string | number): Promise<void> => {
  const company = await Company.findOne({
    where: { id }
  });

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }


  await company.destroy();
};

export default DeleteCompanyService;
