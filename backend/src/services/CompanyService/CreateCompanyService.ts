import AppError from "../../errors/AppError";
import Company from "../../database/models/Company";

interface Request {
  name: string;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  alias: string;
}

const CreateCompanyService = async ({
  name,
  cnpj,
  phone,
  email,
  address,
  alias,
}: Request): Promise<Company> => {
  cnpj = cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")

  const nameExists = await Company.findOne({
    where: {
            cnpj,
    }
  });
  if (nameExists) {
    throw new AppError("ERR__SHORTCUT_DUPLICATED_COMPANY");
  }

  const company = await Company.create(
    {
      name,
      cnpj,
      phone,
      email,
      address,
      alias,
    },
  );
    return company.reload();
};

export default CreateCompanyService;
