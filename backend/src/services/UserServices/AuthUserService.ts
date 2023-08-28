import User from "../../models/User";
import AppError from "../../errors/AppError";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";
import Queue from "../../models/Queue";
import Company from "../../models/Company";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  queues: Queue[];
  companies: Company[];
}

interface Request {
  email: string;
  password: string;
  company: string;
}

interface Response {
  serializedUser: SerializedUser;
  token: string;
  refreshToken: string;
}

const AuthUserService = async ({
  email,
  password,
  company
}: Request): Promise<Response> => {
  const user = await User.findOne({
    where: { email },
    include: ["queues","companies"]
  });

  if(company == ''){
    throw new AppError("ERR_COMPANY_NOT_SELECTED", 412);
  }

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  if (!(await user.checkPassword(password))) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  const allowCompany = user?.companies.some(it => it.id === parseInt(company));

  if(!allowCompany){
    throw new AppError("ERR_COMPANY_NOT_ALLOWED", 412);
  }

  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const serializedUser = SerializeUser(user);

  return {
    serializedUser,
    token,
    refreshToken
  };
};

export default AuthUserService;
