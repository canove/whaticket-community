import { Request, Response } from "express";

import ListCategoryService from "../services/CategoryServices/ListCategoryService";
import CreateCategoryService from "../services/CategoryServices/CreateCategoryService";
import ShowCategoryService from "../services/CategoryServices/ShowCategoryService";
import UpdateCategoryService from "../services/CategoryServices/UpdateCategoryService";
import DeleteCategoryService from "../services/CategoryServices/DeleteCategoryService";

import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";

interface CategoryData {
    name: string;
    description:string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {

  const category = await ListCategoryService();

  return res.status(200).json(category);
};

export const store = async (req: Request, res: Response): Promise<Response> => {

  const {name, description,}: CategoryData = req.body;

  const category = await CreateCategoryService({
    name,
    description,
  });

  const io = getIO();
  io.emit("category", {
    action: "create",
    category
  });

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

  const categoryData: CategoryData = req.body;
  const { categoryId } = req.params;

  const category = await UpdateCategoryService({ categoryData, categoryId });

  const io = getIO();
  io.emit("category", {
    action: "update",
    category
  });

  return res.status(200).json(category);
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
    categoryId
  });

  return res.status(200).json({ message: "Category deleted" });
};
