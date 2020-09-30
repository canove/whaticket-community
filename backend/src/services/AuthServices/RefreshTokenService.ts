import { verify } from "jsonwebtoken";
import AppError from "../../errors/AppError";
import ShowUserService from "../UserServices/ShowUserService";
import authConfig from "../../config/auth";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";

interface RefreshTokenPayload {
  id: string;
  tokenVersion: number;
}

interface Response {
  newToken: string;
  refreshToken: string;
}

export const RefreshTokenService = async (token: string): Promise<Response> => {
  let decoded;

  try {
    decoded = verify(token, authConfig.refreshSecret);
  } catch (err) {
    throw new AppError("Session expire. Please login.", 401);
  }

  const { id, tokenVersion } = decoded as RefreshTokenPayload;

  const user = await ShowUserService(id);

  if (!user) {
    throw new AppError("No user found with this ID.", 401);
  }

  if (user.tokenVersion !== tokenVersion) {
    throw new AppError("Session revoked. Please login.", 401);
  }

  const newToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  return { newToken, refreshToken };
};
