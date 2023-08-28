import Company from "../../models/Company";

interface Request {
  name: string;
}

interface Response {
  company?: Company;
}

const CreateCompanyService = async ({
  name,
}: Request): Promise<Response> => { 
 

  const company = await Company.create(
    {
      name,
    }
  );
 
  return { company };
};

export default CreateCompanyService;