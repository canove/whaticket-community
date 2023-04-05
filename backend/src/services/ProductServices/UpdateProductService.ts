import Product from "../../database/models/Products";
import ShowProductService from "./ShowProductService";

interface ProductData {
  name: string;
  monthlyFee: number;
  triggerFee: number;
  monthlyInterestRate: number;
  penaltyMount: number;
  receivedMessageFee: number;
  sentMessageFee: number;
}

interface Request {
  productData: ProductData;
  productId: number | string;
}

const UpdateProductService = async ({
  productData,
  productId
}: Request): Promise<Product> => {
  const product = await ShowProductService(productId);

  const {
    name,
    monthlyFee,
    triggerFee,
    monthlyInterestRate,
    penaltyMount,
    receivedMessageFee,
    sentMessageFee
  } = productData;

  await product.update({
    name,
    monthlyFee,
    triggerFee,
    monthlyInterestRate,
    penaltyMount,
    receivedMessageFee,
    sentMessageFee
  });

  await product.reload();

  return product;
};

export default UpdateProductService;
