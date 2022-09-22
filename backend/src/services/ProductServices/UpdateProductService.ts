import Product from "../../database/models/Products";
import ShowProductService from "./ShowProductService";

interface ProductData {
  name: string;
  monthlyFee: number;
  triggerFee: number;
  monthlyInterestRate: number;
  lateFine: number;
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

  const { name, monthlyFee, triggerFee, monthlyInterestRate, lateFine } =
    productData;

  await product.update({
    name,
    monthlyFee,
    triggerFee,
    monthlyInterestRate,
    lateFine
  });

  return product;
};

export default UpdateProductService;
