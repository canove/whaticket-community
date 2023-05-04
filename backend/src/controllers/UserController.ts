import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CheckSettingsHelper from "../helpers/CheckSettings";
import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import UpdateUserLanguageService from "../services/UserServices/UpdateUserLanguageService";
import ListAllUsersService from "../services/UserServices/ListAllUsersService";
import ListTransferUsersService from "../services/UserServices/ListTransferUsersService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  queueId: string | number;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ users, count, hasMore });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const users = await ListAllUsersService({ companyId });

  return res.json(users);
};

export const transferList = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam } = req.query as IndexQuery;
  const { companyId } = req.user;

  const users = await ListTransferUsersService({
    searchParam,
    companyId
  });

  return res.json(users);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, name, profile, profileId, queueIds, companyId } = req.body;
  const userCompanyId = req.user.companyId;

  // if (
  //   req.url === "/signup" &&
  //   (await CheckSettingsHelper("userCreation")) === "disabled"
  // ) {
  //   throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  // } else if (req.url !== "/signup" && req.user.profile !== 1) {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  if (userCompanyId === 1) {
    const user = await CreateUserService({
      email,
      password,
      name,
      profile,
      profileId,
      queueIds,
      companyId: companyId || userCompanyId
    });

    const io = getIO();
    io.emit(`user${userCompanyId}`, {
      action: "create",
      user
    });

    return res.status(200).json(user);
  }

  const user = await CreateUserService({
    email,
    password,
    name,
    profile,
    profileId: profileId ? profileId : req.user.profile,
    queueIds,
    companyId: userCompanyId
  });

  const io = getIO();
  io.emit(`user${userCompanyId}`, {
    action: "create",
    user
  });

  return res.status(200).json(user);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { userId } = req.params;
  const { companyId } = req.user;

  const user = await ShowUserService(userId, companyId);

  return res.status(200).json(user);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  // if (req.user.profile !== 1) {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  const { userId } = req.params;
  const userData = req.body;
  const userCompanyId = req.user.companyId;

  const user = await UpdateUserService({ userData, userId, userCompanyId });

  const io = getIO();
  io.emit(`user${userCompanyId}`, {
    action: "update",
    user
  });

  return res.status(200).json(user);
};

export const updateLanguage = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { userId } = req.params;
  const { language } = req.body;
  const { companyId } = req.user;

  const user = await UpdateUserLanguageService({
    userId,
    language,
    companyId
  });

  const io = getIO();
  io.emit(`user${companyId}`, {
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
  const { companyId } = req.user;

  if (req.user.profile !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  await DeleteUserService(userId, companyId);

  const io = getIO();
  io.emit(`user${companyId}`, {
    action: "delete",
    userId
  });

  return res.status(200).json({ message: "User deleted" });
};
