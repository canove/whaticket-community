import { Request, Response } from "express";

import CheckSettingsHelper from "../helpers/CheckSettingsHelper";
import AppError from "../errors/AppError";

import CreateUserService from "../services/CreateUserService";
import ListUsersService from "../services/ListUsersService";
import UpdateUserService from "../services/UpdateUserService";
import FindUserService from "../services/FindUserService";
import DeleteUserService from "../services/DeleteUserService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("Only administrators can access this route.", 403); // should be handled better.
  }
  const { searchParam, pageNumber } = req.query as any;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber
  });

  return res.json({ users, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, name, profile } = req.body;

  if (
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("User creation is disabled by administrator.", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("Only administrators can create users.", 403);
  }

  const user = await CreateUserService({
    email,
    password,
    name,
    profile
  });

  return res.status(200).json(user);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;

  const user = await FindUserService(userId);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("Only administrators can edit users.", 403);
  }

  const { userId } = req.params;
  const userData = req.body;

  const user = await UpdateUserService({ userData, userId });

  return res.status(200).json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("Only administrators can delete users.", 403);
  }

  await DeleteUserService(userId);

  return res.status(200).json({ message: "User deleted" });
};
