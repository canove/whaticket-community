import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { getIO } from "../libs/socket";

import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber
  });

  return res.json({ users, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, name, profile, queueIds, whatsappId } = req.body;

  if (
    req.url === "/signup" &&
    (await CheckSettingsHelper("userCreation")) === "disabled"
  ) {
    throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  } else if (req.url !== "/signup" && req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const user = await CreateUserService({
    email,
    password,
    name,
    profile,
    queueIds,
    whatsappId
  });

  const io = getIO();
  io.emit("user", {
    action: "create",
    user
  });

  return res.status(200).json(user);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;

  const user = await ShowUserService(userId);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { userId } = req.params;
  const userData = req.body;

  const user = await UpdateUserService({ userData, userId });

  const io = getIO();
  io.emit("user", {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  if (req.user.profile !== "admin") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteUserService(userId);

  const io = getIO();
  io.emit("user", {
    action: "delete",
    userId
  });

  return res.status(200).json({ message: "User deleted" });
};

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const image = req.file?.filename;

  const userExists = await ShowUserService(userId);
  if (!userExists) {
    throw new AppError("ERR_NO_USER", 404);
  }

  const user = await UpdateUserService({ userData: { image }, userId });

  const io = getIO();
  io.emit("user", {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const deleteTemporaryImage = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  const tempFolder = path.join(`${__dirname}../../../public/uploads/temp`);
  if (fs.existsSync(tempFolder)) {
    fs.readdirSync(tempFolder).forEach(file => {
      const curPath = `${tempFolder}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        fs.rmdirSync(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
  } else {
    throw new Error("uploads/temp folder not found");
  }

  return res.status(204);
};

export const deleteImage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;

  const userExists = await ShowUserService(userId);
  if (!userExists) {
    throw new AppError("ERR_NO_USER", 404);
  }

  const imagePath = path.join(
    `${__dirname}../../../public/uploads/${userExists.image}`
  );
  if (fs.existsSync(imagePath)) {
    fs.unlinkSync(imagePath);
  }

  const user = await UpdateUserService({ userData: { image: "" }, userId });

  const io = getIO();
  io.emit("user", {
    action: "update",
    user
  });

  return res.status(200).json(user);
};
