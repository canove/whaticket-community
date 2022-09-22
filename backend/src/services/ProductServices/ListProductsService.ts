import Product from "../../database/models/Products";

const ListProductsService = async (): Promise<Product[]> => {
  const products = await Product.findAll();

  return products;
};

export default ListProductsService;
