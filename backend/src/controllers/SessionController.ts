import { Request, Response } from "express";
import AppError from "../errors/AppError";

import AuthUserService from "../services/UserServices/AuthUserService";
import { RefreshTokenService } from "../services/AuthServices/RefreshTokenService";
import { SendRefreshToken } from "../helpers/SendRefreshToken";
import User from "../database/models/User";
import { decrypt, encrypt } from "../utils/encriptor";

const externalip = require("external-ip");
const firebase = require("../utils/Firebase");

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password, company, retry } = req.body;

  let userIp = "";

  try {
    externalip(function (err, ip) {
      userIp = ip;
    });
  } catch {}

  const { token, serializedUser, refreshToken, accountConnected } = await AuthUserService({
    email,
    password,
    company,
    retry,
    userIp
  });

  if (accountConnected) {
    return res.status(200).json({ accountConnected });
  }

  SendRefreshToken(res, refreshToken);

  return res.status(200).json({
    token,
    user: serializedUser,
    accountConnected
  });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const token: string = req.cookies.jrt;
  const authHeader = req.headers.authorization;
  const [, localToken] = authHeader.split(" ");

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { user, newToken, refreshToken } = await RefreshTokenService(
    res,
    token
  );

  SendRefreshToken(res, refreshToken);

  const database = await firebase.database();

  const firebaseUser = await database
  .collection("Authentication")
  .doc(`${user.companyId}-${user.email}`)
  .get();

  if (localToken && firebaseUser.exists) {
    const firebaseData = firebaseUser.data();
    const firebaseToken = decrypt(firebaseData.token);

    if (firebaseToken === localToken) {
      await database
      .collection("Authentication")
      .doc(`${user.companyId}-${user.email}`)
      .set(
        {
          token: encrypt(newToken),
          oldToken: firebaseData.token
        }, 
        { merge: true }
      );
    } else {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }
  }

  return res.json({ token: newToken, user });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id } = req.user;

  const user = await User.findOne({
    where: { id }
  });

  const database = await firebase.database();

  await database
  .collection("Authentication")
  .doc(`${user.companyId}-${user.email}`)
  .delete()

  res.clearCookie("jrt");

  return res.send();
};
