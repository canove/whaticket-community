import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import CreateCategoryService from "../services/CategoryService/CreateCategoryService";
import DeleteCategoryService from "../services/CategoryService/DeleteCategoryService";
import ListCategorysService from "../services/CategoryService/ListCategorysService";
import ShowCategoryService from "../services/CategoryService/ShowCategoryService";
import UpdateCategoryService from "../services/CategoryService/UpdateCategoryService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const categorys = await ListCategorysService();

  return res.status(200).json(categorys);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color } = req.body;

  const category = await CreateCategoryService({
    name,
    color
  });

  const io = getIO();
  io.emit("category", {
    action: "update",
    category
  });

  /* const ioClient = getIOClient();
  ioClient.emit("category", {
    action: "update",
    category
  }); */

  return res.status(200).json(category);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { categoryId } = req.params;

  const category = await ShowCategoryService(categoryId);

  return res.status(200).json(category);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { categoryId } = req.params;

  const category = await UpdateCategoryService(categoryId, req.body);

  const io = getIO();
  io.emit("category", {
    action: "update",
    category
  });

  return res.status(201).json(category);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { categoryId } = req.params;

  await DeleteCategoryService(categoryId);

  const io = getIO();
  io.emit("category", {
    action: "delete",
    categoryId: +categoryId
  });

  return res.status(200).send();
};
