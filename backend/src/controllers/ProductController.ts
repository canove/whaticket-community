import { Request, Response } from "express";

import ListProductsService from "../services/ProductServices/ListProductsService";
import CreateProductService from "../services/ProductServices/CreateProductService";
import ShowProductService from "../services/ProductServices/ShowProductService";
import UpdateProductService from "../services/ProductServices/UpdateProductService";
import DeleteProductService from "../services/ProductServices/DeleteProductService";

import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import CreateHistoricService from "../services/HistoricServices/CreateHistoricService";

interface ProductData {
  name: string;
  triggerFee: number;
  monthlyInterestRate: number;
  penaltyMount: number;
  receivedMessageFee: number;
  sentMessageFee: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const products = await ListProductsService();

  return res.status(200).json(products);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const {
    name,
    triggerFee,
    monthlyInterestRate,
    penaltyMount,
    receivedMessageFee,
    sentMessageFee
  }: ProductData = req.body;

  const product = await CreateProductService({
    name,
    triggerFee,
    monthlyInterestRate,
    penaltyMount,
    receivedMessageFee,
    sentMessageFee
  });

  await CreateHistoricService({
    userId: user.id,
    systemChange: 0,
    update: product,
    registerId: product.id,
    actionType: 0
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

  if (user.profile !== 1 || user.companyId !== 1) {
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

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const productData: ProductData = req.body;
  const { productId } = req.params;

  const product = await UpdateProductService({ productData, productId });

  await CreateHistoricService({
    userId: user.id,
    systemChange: 0,
    update: product,
    registerId: product.id,
    actionType: 1
  });

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

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { productId } = req.params;

  await DeleteProductService(productId);

  await CreateHistoricService({
    userId: user.id,
    systemChange: 0,
    update: "Deleted",
    registerId: productId,
    actionType: 2
  });

  const io = getIO();
  io.emit("product", {
    action: "delete",
    productId
  });

  return res.status(200).json({ message: "Product deleted" });
};
