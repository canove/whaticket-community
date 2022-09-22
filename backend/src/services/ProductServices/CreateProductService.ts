import Product from "../../database/models/Products";

interface Request {
  name: string;
  monthlyFee: number;
  triggerFee: number;
  monthlyInterestRate: number;
  lateFine: number;
}

const CreateProductService = async ({
  name,
  monthlyFee,
  triggerFee,
  monthlyInterestRate,
  lateFine
}: Request): Promise<Product> => {
  const product = await Product.create({
    name,
    monthlyFee,
    triggerFee,
    monthlyInterestRate,
    lateFine
  });

  return product;
};

export default CreateProductService;
