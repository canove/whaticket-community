import Company from "../../models/Company";
import AppError from "../../errors/AppError";

const ShowCompanyService = async (id: string | number): Promise<Company> => {
  const company = await Company.findByPk(id);

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  return company;
};

export default ShowCompanyService;
