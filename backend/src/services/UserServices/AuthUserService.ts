import { Op, Sequelize } from "sequelize";

import AppError from "../../errors/AppError";
import {
  createAccessToken,
  createRefreshToken
} from "../../helpers/CreateTokens";
import { SerializeUser } from "../../helpers/SerializeUser";

import User from "../../database/models/User";
import Queue from "../../database/models/Queue";
import Company from "../../database/models/Company";
import { decrypt, encrypt } from "../../utils/encriptor";
import Packages from "../../database/models/Packages";
import Pricing from "../../database/models/Pricing";
import ListCompanySettingsService from "../SettingServices/ListCompanySettingsService";
import ShowProfileService from "../ProfileServices/ShowProfileService";

const firebase = require("../../utils/Firebase");

interface SerializedUser {
  id: number;
  name: string;
  email: string;
  profile: string;
  profileId: number;
  lang: string;
  queues: Queue[];
}

interface Request {
  email: string;
  password: string;
  company: string;
  retry: boolean;
  userIp: string;
}

interface Response {
  serializedUser?: SerializedUser;
  token?: string;
  refreshToken?: string;
  accountConnected: boolean;
}

const AuthUserService = async ({
  email,
  password,
  company,
  retry,
  userIp
}: Request): Promise<Response> => {
  const whereCondition = {
    "$Company.name$": Sequelize.where(
      Sequelize.fn("LOWER", Sequelize.col("Company.alias")),
      "LIKE",
      `%${company.toLowerCase()}%`
    )
  };

  const companyDb = await Company.findOne({
    where: whereCondition
  });

  if (!companyDb) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  const user = await User.findOne({
    where: { email, companyId: companyDb.id, deletedAt: null },
    include: ["queues"]
  });

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  if (!(await user.checkPassword(password))) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  const settings = await ListCompanySettingsService(companyDb.id);
  const allowedIPs = settings.allowedIPs ? settings.allowedIPs : [];

  if (allowedIPs.length > 0 && !allowedIPs.includes(userIp) && !user.superAdmin) {
      throw new AppError("ERR_IP_NOT_ALLOWED");
  }

  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const database = await firebase.database();

  const firebaseUser = await database
  .collection("Authentication")
  .doc(`${user.companyId}-${user.email}`)
  .get();

  if (firebaseUser.exists && !retry) {
    return { accountConnected: true };
  } else {
    if (!firebaseUser.exists) {
      const allLoggedUsers = await database
      .collection("Authentication")
      .where("companyId", "==", user.companyId)
      .get();

      const loggedUsersQuantity = allLoggedUsers.docs.length;

      const pack = await Packages.findOne({
        include: [
          {
            model: Pricing,
            as: "pricings",
            where: { companyId: user.companyId },
            required: true
          }
        ]
      });

      const loggedUsersLimit = pack ? pack.maxUsers : null;

      if (loggedUsersLimit && loggedUsersLimit <= loggedUsersQuantity) {
        throw new AppError("LOGGED_USERS_REACHED_THE_LIMIT");
      }
    }
    
    await database
    .collection("Authentication")
    .doc(`${user.companyId}-${user.email}`)
    .set(
      {
        authDate: new Date(),
        companyAlias: companyDb.alias,
        companyId: user.companyId,
        email: user.email,
        isAuth: true,
        token: encrypt(token),
        userIp
      },
    );
  }

  let serializedUser = SerializeUser(user);

  const profiles = await ShowProfileService(user.profileId, user.companyId);

  serializedUser = { ...serializedUser, profiles };

  return {
    serializedUser,
    token,
    refreshToken,
    accountConnected: false,
  };
};

export default AuthUserService;
