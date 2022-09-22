import { Request, Response } from "express";

import ListProductsService from "../services/ProductServices/ListProductsService";
import CreateProductService from "../services/ProductServices/CreateProductService";
import ShowProductService from "../services/ProductServices/ShowProductService";
import UpdateProductService from "../services/ProductServices/UpdateProductService";
import DeleteProductService from "../services/ProductServices/DeleteProductService";

import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

interface ProductData {
  name: string;
  monthlyFee: number;
  triggerFee: number;
  monthlyInterestRate: number;
  lateFine: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== "admin" || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const products = await ListProductsService();

  return res.status(200).json(products);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== "admin" || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

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

  const io = getIO();
  io.emit("product", {
    action: "create",
    product
  });

  return res.status(200).json(product);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== "admin" || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { productId } = req.params;

  const product = await ShowProductService(productId);

  return res.status(200).json(product);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { user } = req;

  if (user.profile !== "admin" || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const productData: ProductData = req.body;
  const { productId } = req.params;

  const product = await UpdateProductService({ productData, productId });

  const io = getIO();
  io.emit("product", {
    action: "update",
    product
  });

  return res.status(200).json(product);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { user } = req;

  if (user.profile !== "admin" || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { productId } = req.params;

  await DeleteProductService(productId);

  const io = getIO();
  io.emit("product", {
    action: "delete",
    productId
  });

  return res.status(200).json({ message: "Product deleted" });
};
