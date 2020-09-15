import { Request, Response } from "express";

import AuthUserService from "../services/UserServices/AuthUserSerice";

const store = async (req: Request, res: Response): Promise<Response> => {
  const { email, password } = req.body;

  const { user, token } = await AuthUserService({ email, password });

  return res.status(200).json({
    user,
    token
  });
};

export default store;
