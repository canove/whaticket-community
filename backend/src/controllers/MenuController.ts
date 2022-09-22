import { Request, Response } from "express";

import ListMenusService from "../services/MenuServices/ListMenusService";
import ShowMenuService from "../services/MenuServices/ShowMenuService";
import ShowCompanyMenuService from "../services/MenuServices/ShowCompanyMenuService";
import CreateMenuService from "../services/MenuServices/CreateMenuService";
import UpdateMenuService from "../services/MenuServices/UpdateMenuService";
import { getIO } from "../libs/socket";
import AppError from "../errors/AppError";
import DeleteMenuService from "../services/MenuServices/DeleteMenuService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const menus = await ListMenusService();

  return res.json(menus);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { menuId } = req.params;

  const menu = await ShowMenuService(menuId);

  return res.status(200).json(menu);
};

export const showCompany = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const menus = await ShowCompanyMenuService(req.user.companyId);

  return res.status(200).json(menus);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, icon, parentId, isParent } = req.body;

  const menu = await CreateMenuService({
    name,
    icon,
    parentId,
    isParent
  });

 const io = getIO();
  io.emit("menu", {
    action: "create",
    menu
  });

  return res.status(200).json(menu);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { menuId } = req.params;
  const menuData = req.body;

  const menu = await UpdateMenuService({ menuData, menuId });

  const io = getIO();
  io.emit("menu", {
    action: "update",
    menu
  });

  return res.status(200).json(menu);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { menuId } = req.params;

  await DeleteMenuService(menuId);

  const io = getIO();
  io.emit("menu", {
    action: "delete",
    menuId
  });

  return res.status(200).json({ message: "Menu deleted" });
};
