import User from "../../database/models/User";
import AppError from "../../errors/AppError";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";
import Queue from "../../database/models/Queue";
import Company from "../../database/models/Company";
import { Op, Sequelize } from "sequelize";

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  lang: string;
  queues: Queue[];
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
  const whereCondition = {
    [Op.or]: [
      {
        "$Company.name$": Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("Company.name")),
          "LIKE",
          `%${company.toLowerCase()}%`
        )
      },
      { id: { [Op.like]: `%${company.toLowerCase()}%` } }
    ]
  };

  const companyDb = await Company.findOne({
    where: whereCondition
  });

if (!companyDb) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  const user = await User.findOne({
    where: { email, companyId: companyDb.id },
    include: ["queues"]
  });

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  if (!(await user.checkPassword(password))) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
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
