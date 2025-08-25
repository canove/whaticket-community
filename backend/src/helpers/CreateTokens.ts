import { sign } from "jsonwebtoken";
import authConfig from "../config/auth";
import User from "../models/User";

export const createAccessToken = (user: User): string => {
  const { secret, expiresIn } = authConfig;

  return sign(
    {
      username: user.name,
      profile: user.profile,
      id: user.id,
      tenantId: user.tenantId
    },
    secret,
    {
      expiresIn
    }
  );
};

export const createRefreshToken = (user: User): string => {
  const { refreshSecret, refreshExpiresIn } = authConfig;

  return sign({
    id: user.id,
    tokenVersion: user.tokenVersion,
    tenantId: user.tenantId
  }, refreshSecret, {
    expiresIn: refreshExpiresIn
  });
};
