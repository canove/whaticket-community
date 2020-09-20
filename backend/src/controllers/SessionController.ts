import { Request, Response } from "express";

import AuthUserService from "../services/UserServices/AuthUserSerice";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const { token, user } = await AuthUserService({ email, password });

  return res.status(200).json({
    token,
    username: user.name,
    profile: user.profile,
    userId: user.id
  });
};
