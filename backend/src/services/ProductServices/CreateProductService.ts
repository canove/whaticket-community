import Product from "../../database/models/Products";

interface Request {
  name: string;
  monthlyFee: number;
  triggerFee: number;
  monthlyInterestRate: number;
  penaltyMount: number;
}

const CreateProductService = async ({
  name,
  monthlyFee,
  triggerFee,
  monthlyInterestRate,
  penaltyMount
}: Request): Promise<Product> => {
  const product = await Product.create({
    name,
    monthlyFee,
    triggerFee,
    monthlyInterestRate,
    penaltyMount
  });

  return product;
};

export default CreateProductService;
