import { Request, Response } from "express";

import GetBrandingService from "../services/SettingServices/GetBrandingService";
import UpdateBrandingService from "../services/SettingServices/UpdateBrandingService";

export const show = async (req: Request, res: Response): Promise<Response> => {
  const branding = await GetBrandingService();
  return res.status(200).json(branding);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { appName, primaryColor, secondaryColor } = req.body;
  await UpdateBrandingService({ appName, primaryColor, secondaryColor });
  const branding = await GetBrandingService();
  return res.status(200).json(branding);
};
