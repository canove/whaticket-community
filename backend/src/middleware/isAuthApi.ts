import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import CheckSettings from "../helpers/CheckSettings";

const isAuthApi = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const apiToken = await CheckSettings("userApiToken");

    if (token !== apiToken) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
  } catch (err) {
    console.log(err);
    throw new AppError(
      "Invalid token. We'll try to assign a new one on next request",
      403
    );
  }

  return next();
};

export default isAuthApi;
