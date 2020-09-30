import { Response } from "express";

export const SendRefreshToken = (res: Response, token: string): void => {
  res.cookie("jrt", token, { httpOnly: true });
};
