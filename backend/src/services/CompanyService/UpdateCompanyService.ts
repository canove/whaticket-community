import * as Yup from "yup";
import Company from "../../database/models/Company";

import AppError from "../../errors/AppError";
import ShowCompanyService from "./ShowCompanyService";

interface CompanyData {
  name?: string;
  id: number;
  cnpj?: string;
  phone?: string;
  email?: string;
  address?: string;
  menusIds?: string;
}

interface Request {
  companyData: CompanyData;
  companyId: string | number;
}

interface Response {
  name: string;
  id: number;
  cnpj: string;
  phone: string;
  email: string;
  address: string;
}

const UpdateCompanyService = async ({
  companyData,
  companyId
}: Request): Promise<Response | Company> => {
  const company = await ShowCompanyService(companyId);

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    id: Yup.number()
  });

  const {
    name,
    id,
    cnpj,
    phone,
    email,
    address = [],
    menusIds = []
  } = companyData;

  try {
    await schema.validate({ name, id, cnpj, phone, email, address });
  } catch (err) {
    throw new AppError(err.message);
  }

  await company.update({
    name,
    id,
    cnpj,
    phone,
    email,
    address
  });

  await company.$set("menus", menusIds);

  await company.reload();

  const serializedCompany = {
    name: company.name,
    id: company.id,
    cnpj: company.cnpj,
    phone: company.phone,
    email: company.email,
    address: company.address
  };

  return serializedCompany;
};

export default UpdateCompanyService;
