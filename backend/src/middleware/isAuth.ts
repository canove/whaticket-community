import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import { firebaseAuthentication } from "../utils/firebaseAuthentication";

interface TokenPayload {
  id: string;
  username: string;
  profile: number;
  iat: number;
  exp: number;
  companyId: number;
}

const isAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId } = decoded as TokenPayload;
    
    let firebaseAuthorization = null;
    let firebaseError = false;

    try {
      firebaseAuthorization = await firebaseAuthentication({ userId: id, token });
    } catch (err) {
      console.log("Firebase Error: ", err);
      firebaseError = true;
    }

    if (!firebaseError && !firebaseAuthorization && req.route.path !== "/logout") {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
  
    req.user = {
      id,
      profile,
      companyId
    };
  } catch (err: any) {
    if (err.message === "ERR_SESSION_EXPIRED" && err.statusCode === 401) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    throw new AppError(
      "Invalid token. We'll try to assign a new one on next request",
      403
    );
  }

  return next();
};

export default isAuth;
