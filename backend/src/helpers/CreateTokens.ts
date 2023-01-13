import { sign } from "jsonwebtoken";
import authConfig from "../config/auth";
import User from "../database/models/User";

export const createAccessToken = (user: User): string => {
  const { secret, expiresIn } = authConfig;

  return sign(
    {
      usarname: user.name,
      profile: user.profileId,
      id: user.id,
      companyId: user.companyId
    },
    secret,
    {
      expiresIn
    }
  );
};

export const createRefreshToken = (user: User): string => {
  const { refreshSecret, refreshExpiresIn } = authConfig;

  return sign(
    { id: user.id, tokenVersion: user.tokenVersion, companyId: user.companyId },
    refreshSecret,
    {
      expiresIn: refreshExpiresIn
    }
  );
};
