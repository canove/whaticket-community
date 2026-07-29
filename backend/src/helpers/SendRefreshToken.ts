import { Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  // In production the frontend and backend live on different domains
  // (e.g. Railway), so the refresh cookie must be SameSite=None + Secure to be
  // stored and sent on cross-site requests. In dev (http://localhost) fall back
  // to Lax without Secure so it keeps working locally.
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("jrt", token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  });
};
