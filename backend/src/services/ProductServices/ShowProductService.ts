import Product from "../../database/models/Products";
import AppError from "../../errors/AppError";

const ShowProductService = async (id: string | number): Promise<Product> => {
  const product = await Product.findByPk(id);

  if (!product) {
    throw new AppError("ERR_NO_PRODUCT_FOUND", 404);
  }

  return product;
};

export default ShowProductService;
