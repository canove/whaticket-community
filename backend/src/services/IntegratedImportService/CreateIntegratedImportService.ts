import IntegratedImport from "../../database/models/IntegratedImport";

interface Request {
    id: number;
    name: string;
    method: string;
    qtdeRegister: number;
    status: number;
    url: string;
    key: string;
    token: string;
    mapping: string;
    createdAt: Date;
};

const CreateProductService = async ({

    id,
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,
    createdAt,
}: Request): Promise<IntegratedImport> => {

const integratedImport = await IntegratedImport.create({

    id,
    name,
    method,
    qtdeRegister,
    status,
    url,
    key,
    token,
    mapping,
    createdAt,
  });

  return integratedImport;
};

export default CreateProductService;