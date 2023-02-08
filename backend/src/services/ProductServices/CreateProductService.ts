import Product from "../../database/models/Products";

interface Request {
  name: string;
  monthlyFee: number;
  triggerFee: number;
  monthlyInterestRate: number;
  penaltyMount: number;
  receivedMessageFee: number;
  sentMessageFee: number;
}

const CreateProductService = async ({
  name,
  monthlyFee,
  triggerFee,
  monthlyInterestRate,
  penaltyMount,
  receivedMessageFee,
  sentMessageFee
}: Request): Promise<Product> => {
  const product = await Product.create({
    name,
    monthlyFee,
    triggerFee,
    monthlyInterestRate,
    penaltyMount,
    receivedMessageFee,
    sentMessageFee
  });

  return product;
};

export default CreateProductService;
