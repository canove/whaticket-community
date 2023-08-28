import Company from "../../models/Company";


const ListCompaniesService = async (): Promise<Company[]> => {
  const companies = await Company.findAll();

  return companies;
};

export default ListCompaniesService;
