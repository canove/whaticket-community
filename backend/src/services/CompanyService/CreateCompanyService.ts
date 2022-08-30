import AppError from "../../errors/AppError";
import Company from "../../database/models/Company";

interface Request {
  name: string;
  cnpj?: number;
  phone?: number;
  email?: string;
  address?: string;
}

const CreateCompanyService = async ({
  name,
  cnpj,
  phone,
  email,
  address
}: Request): Promise<Company> => {
  const nameExists = await Company.findOne({
    where: {  name,
              cnpj,
              phone,
              email,
              address
    }
  });

  if (nameExists) {
    throw new AppError("ERR__SHORTCUT_DUPLICATED");
  }

  const company = await Company.create(
    {
      name,
      cnpj,
      phone,
      email,
      address,
    },
  );
    return company.reload();
};

export default CreateCompanyService;
