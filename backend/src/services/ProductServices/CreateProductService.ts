import Product from "../../database/models/Products";

interface Request {
  name: string;
  triggerFee: number;
  monthlyInterestRate: number;
  penaltyMount: number;
  receivedMessageFee: number;
  sentMessageFee: number;
  inboundSessionFee: number;
  outboundSessionFee: number;
}

const CreateProductService = async ({
  name,
  triggerFee,
  monthlyInterestRate,
  penaltyMount,
  receivedMessageFee,
  sentMessageFee,
  inboundSessionFee,
  outboundSessionFee,
}: Request): Promise<Product> => {
  const product = await Product.create({
    name,
    triggerFee,
    monthlyInterestRate,
    penaltyMount,
    receivedMessageFee,
    sentMessageFee,
    inboundSessionFee,
    outboundSessionFee,
  });

  return product;
};

export default CreateProductService;
