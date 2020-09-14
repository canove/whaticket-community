import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  iat: number;
  exp: number;
}

const isAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token not provided.", 403);
  }

  const [, token] = authHeader.split(" ");

  const decoded = verify(token, authConfig.secret);
  const { id, profile } = decoded as TokenPayload;

  req.user = {
    id,
    profile
  };

  return next();
};

export default isAuth;
