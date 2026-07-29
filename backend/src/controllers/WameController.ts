import { Request, Response } from "express";

import { wameGetInfo } from "../providers/WhatsApp/Implementations/wame";

// Returns live wame instance info (official flag, number, profile picture) for a
// connection — fetched on demand from the wame API, never stored.
export const instanceInfo = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const info = await wameGetInfo(Number(whatsappId));
  return res.status(200).json(info);
};
