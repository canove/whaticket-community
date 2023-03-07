import { Request, Response } from "express";

import ListProfileService from "../services/ProfileServices/ListProfileService";
import CreateProfileService from "../services/ProfileServices/CreateProfileService";
import ShowProfileService from "../services/ProfileServices/ShowProfileService";
import UpdateProfileService from "../services/ProfileServices/UpdateProfileService";
import DeleteProfileService from "../services/ProfileServices/DeleteProfileService";
import CheckProfilePermissionService from "../services/ProfileServices/CheckProfilePermissionService"

import { getIO } from "../libs/socket";

type IndexQuery = {
    pageNumber: string;
    limit: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber, limit } = req.query as IndexQuery;
  const { companyId } = req.user;

  const profiles = await ListProfileService({ companyId, pageNumber, limit });

  return res.status(200).json(profiles);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, menus, permissions } = req.body;
  const { companyId } = req.user;

  const profile = await CreateProfileService({
    name,
    menus, 
    permissions,
    companyId
  });

  const io = getIO();
  io.emit(`profile${companyId}`, {
    action: "create",
    profile
  });

  return res.status(200).json(profile);
};

type CheckQuery = {
  permission: string;
} 

export const check = async (req: Request, res: Response): Promise<Response> => {
  const { permission } = req.query as CheckQuery;
  const { companyId, profile } = req.user;

  const response = await CheckProfilePermissionService({ profileId: profile, companyId, permission });

  return res.status(200).json(response);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { profileId } = req.params;
  const { companyId } = req.user;

  const profile = await ShowProfileService(profileId, companyId);

  return res.status(200).json(profile);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const profileData = req.body;
  const { profileId } = req.params;
  const { companyId } = req.user;

  const profile = await UpdateProfileService({
    profileData,
    profileId,
    companyId
  });

  const io = getIO();
  io.emit(`profile${companyId}`, {
    action: "update",
    profile
  });

  return res.status(200).json(profile);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { profileId } = req.params;
  const { companyId } = req.user;

  await DeleteProfileService(profileId, companyId);

  const io = getIO();
  io.emit(`profile${companyId}`, {
    action: "delete",
    profileId
  });

  return res.status(200).json({ message: "Profile deleted" });
};
