import AppError from "../../errors/AppError";
import Company from "../../database/models/Company";

const ShowCompanyService = async (id: string | number): Promise<Company> => {
  const company = await Company.findByPk(id, {
    attributes: ["id", "alias", "name", "cnpj", "phone", "email", "address"],

  });
  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  return company;
};

export default ShowCompanyService;
