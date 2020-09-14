import { sign } from "jsonwebtoken";

import User from "../models/User";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";

interface Request {
  email: string;
  password: string;
}

interface Response {
  user: User;
  token: string;
}

const AuthUserService = async ({
  email,
  password
}: Request): Promise<Response> => {
  const user = await User.findOne({
    where: { email }
  });

  if (!user) {
    throw new AppError("Incorrect user/password combination.", 401);
  }

  if (!(await user.checkPassword(password))) {
    throw new AppError("Incorrect user/password combination.", 401);
  }

  const { secret, expiresIn } = authConfig;
  const token = sign(
    { usarname: user.name, profile: user.profile, id: user.id },
    secret,
    {
      expiresIn
    }
  );

  return {
    user,
    token
  };
};

export default AuthUserService;
