import Product from "../../database/models/Products";
import AppError from "../../errors/AppError";

const DeleteProductService = async (id: string | number): Promise<void> => {
  const product = await Product.findOne({
    where: { id }
  });

  if (!product) {
    throw new AppError("ERR_NO_PRODUCT_FOUND", 404);
  }

  await product.destroy();
};

export default DeleteProductService;
