import { Request, Response, NextFunction } from "express";
import * as Sentry from "@sentry/node";

import AppError from "../errors/AppError";
import ListSettingByValueService from "../services/SettingServices/ListSettingByValueService";
import { logger } from "../utils/logger";

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
    const getToken = await ListSettingByValueService(token);
    if (!getToken) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    if (getToken.value !== token) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
  } catch (err) {
    logger.error(err);
    Sentry.captureException(err);
    throw new AppError(
      "Invalid token. We'll try to assign a new one on next request",
      403
    );
  }

  return next();
};

export default isAuthApi;
