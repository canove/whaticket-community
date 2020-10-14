import { Request, Response } from "express";
import AppError from "../errors/AppError";

import AuthUserService from "../services/UserServices/AuthUserSerice";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const { token, user, refreshToken } = await AuthUserService({
    email,
    password
  });

  SendRefreshToken(res, refreshToken);

  return res.status(200).json({
    token,
    username: user.name,
    profile: user.profile,
    userId: user.id
  });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { newToken, refreshToken } = await RefreshTokenService(token);

  SendRefreshToken(res, refreshToken);

  return res.json({ token: newToken });
};
