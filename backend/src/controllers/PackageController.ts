import { Request, Response } from "express";

import ListPackagesService from "../services/PackageServices/ListPackagesService";
import CreatePackageService from "../services/PackageServices/CreatePackageService";
import ShowPackageService from "../services/PackageServices/ShowPackageService";
import UpdatePackageService from "../services/PackageServices/UpdatePackageService";
import DeletePackageService from "../services/PackageServices/DeletePackageService";

import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import CreateHistoricService from "../services/HistoricServices/CreateHistoricService";

interface PackageData {
  name: string;
  maxUsers: number;
  extraUserPrice: number;
  maxTicketsByMonth: number;
  extraTicketPrice: number;
  whatsappMonthlyPrice: number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const packages = await ListPackagesService();

  return res.status(200).json(packages);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const {
    name,
    maxUsers,
    extraUserPrice,
    maxTicketsByMonth,
    extraTicketPrice,
    whatsappMonthlyPrice,
  }: PackageData = req.body;

  const pack = await CreatePackageService({
    name,
    maxUsers,
    extraUserPrice,
    maxTicketsByMonth,
    extraTicketPrice,
    whatsappMonthlyPrice,
  });

  await CreateHistoricService({
    userId: user.id,
    systemChange: 2,
    update: pack,
    registerId: pack.id,
    actionType: 0
  });

  const io = getIO();
  io.emit("pack", {
    action: "create",
    pack
  });

  return res.status(200).json(pack);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { user } = req;

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { packageId } = req.params;

  const pack = await ShowPackageService(packageId);

  return res.status(200).json(pack);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { user } = req;

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const packageData: PackageData = req.body;
  const { packageId } = req.params;

  const pack = await UpdatePackageService({ packageData, packageId });

  await CreateHistoricService({
    userId: user.id,
    systemChange: 2,
    update: pack,
    registerId: pack.id,
    actionType: 1
  });

  const io = getIO();
  io.emit("pack", {
    action: "update",
    pack
  });

  return res.status(200).json(pack);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { user } = req;

  if (user.profile !== 1 || user.companyId !== 1) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  const { packageId } = req.params;

  await DeletePackageService(packageId);

  await CreateHistoricService({
    userId: user.id,
    systemChange: 2,
    update: "Deleted",
    registerId: packageId,
    actionType: 2
  });

  const io = getIO();
  io.emit("product", {
    action: "delete",
    packageId
  });

  return res.status(200).json({ message: "Package deleted" });
};
