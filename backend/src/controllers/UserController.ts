import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import AppError from "../errors/AppError";

import CreateUserService from "../services/UserServices/CreateUserService";
import ListUsersService from "../services/UserServices/ListUsersService";
import UpdateUserService from "../services/UserServices/UpdateUserService";
import ShowUserService from "../services/UserServices/ShowUserService";
import DeleteUserService from "../services/UserServices/DeleteUserService";
import ListAllUsersService from "../services/UserServices/ListAllUsersService";
import ListTransferUsersService from "../services/UserServices/ListTransferUsersService";
import CheckProfilePermissionService from "../services/ProfileServices/CheckProfilePermissionService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  queueId: string | number;
  selectedCompanyId: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, selectedCompanyId } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { users, count, hasMore } = await ListUsersService({
    searchParam,
    pageNumber,
    companyId,
    selectedCompanyId,
  });

  return res.json({ users, count, hasMore });
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { id: loggedInUserId, companyId } = req.user;

  const users = await ListAllUsersService({ companyId, loggedInUserId });

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
  const { email, password, name, profile, profileId, queueIds, companyId: selectedCompanyId, superAdmin, nickname, useNickname, lang } = req.body;
  const { id: userId, companyId } = req.user;

  // if (
  //   req.url === "/signup" &&
  //   (await CheckSettingsHelper("userCreation")) === "disabled"
  // ) {
  //   throw new AppError("ERR_USER_CREATION_DISABLED", 403);
  // } else if (req.url !== "/signup" && req.user.profile !== 1) {
  //   throw new AppError("ERR_NO_PERMISSION", 403);
  // }

  const permission = CheckProfilePermissionService({ userId, companyId, permission: "user-modal:editProfile" });

  if (!permission) throw new AppError("ERR_NO_PERMISSION", 403);

  const user = await CreateUserService({
    email,
    password,
    name,
    profile,
    profileId: (profileId) ? profileId : req.user.profile,
    queueIds,
    companyId: (companyId === 1 && selectedCompanyId) ? selectedCompanyId : companyId,
    superAdmin,
    nickname,
    useNickname,
    lang,
  });

  const io = getIO();
  io.emit(`user${(companyId === 1 && selectedCompanyId) ? selectedCompanyId : companyId}`, {
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
  const { companyId } = req.user;

  const user = await UpdateUserService({ userData, userId, userCompanyId: companyId });

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
