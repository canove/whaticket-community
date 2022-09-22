import { Request, Response } from "express";

import ListProductsService from "../services/ProductServices/ListProductsService";
import CreateProductService from "../services/ProductServices/CreateProductService";
import DeleteProductService from "../services/ProductServices/DeleteProductService";
import ShowProductService from "../services/ProductServices/ShowProductService";
import UpdateProductService from "../services/ProductServices/UpdateProductService";

interface ProductData {
  name: string;
  monthlyFee: number;
  triggerFee: number;
  monthlyInterestRate: number;
  lateFine: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const products = await ListProductsService();

  return res.status(200).json(products);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    monthlyFee,
    triggerFee,
    monthlyInterestRate,
    lateFine
  }: ProductData = req.body;

  const product = await CreateProductService({
    name,
    monthlyFee,
    triggerFee,
    monthlyInterestRate,
    lateFine
  });

  return res.status(200).json(product);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { productId } = req.params;

  const product = await ShowProductService(productId);

  return res.status(200).json(product);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const productData: ProductData = req.body;
  const { productId } = req.params;

  const product = await UpdateProductService({ productData, productId });

  return res.status(200).json(product);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { productId } = req.params;

  await DeleteProductService(productId);

  return res.status(200).json({ message: "Product deleted" });
};
