import * as Yup from "yup";

import AppError from "../../errors/AppError";
import ShowCompanyService from "../CompanyService/ShowCompanyService";
import ShowProfileService from "../ProfileServices/ShowProfileService";
import ShowUserService from "./ShowUserService";
import { SerializeUser } from "../../helpers/SerializeUser";
import CheckProfilePermissionService from "../ProfileServices/CheckProfilePermissionService";

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  profile?: string;
  profileId?: string;
  lang?: string;
  queueIds?: number[];
  companyId?: string | number;
  superAdmin?: boolean;
  nickname?: string;
  useNickname?: boolean;
}

interface Request {
  userData: UserData;
  userId: string | number;
  userCompanyId: string | number;
}

interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
}

const UpdateUserService = async ({
  userData,
  userId,
  userCompanyId,
}: Request): Promise<Response | undefined> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    email: Yup.string().email(),
    profile: Yup.string(),
    password: Yup.string()
  });

  const { email, password, profile, profileId, name, lang, nickname, useNickname, queueIds = [] } = userData;
  let { companyId, superAdmin } = userData;

  if (userCompanyId !== 1) {
    companyId = userCompanyId;
    superAdmin = false;
  }

  if (!companyId) companyId = userCompanyId

  const user = await ShowUserService(userId, companyId);

  try {
    await schema.validate({ email, password, profile, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  if (useNickname && !nickname) throw new AppError("ERR_NO_NICKNAME");

  const profilePermission = CheckProfilePermissionService({ userId, companyId: userCompanyId, permission: "user-modal:editProfile" });
  const queuesPermission = CheckProfilePermissionService({ userId, companyId: userCompanyId, permission: "user-modal:editQueues" });
  
  await user.update({
    email,
    password,
    profile,
    profileId: (profilePermission) ? profileId : user.profileId,
    lang,
    name,
    companyId,
    superAdmin,
    nickname,
    useNickname,
  });

  if (queuesPermission) {
    await user.$set("queues", queueIds);
  }

  await user.reload();

  let serializedUser = SerializeUser(user);

  const company = await ShowCompanyService(companyId);
  const profiles = await ShowProfileService(user.profileId, companyId);

  serializedUser = { ...serializedUser, company, profiles };

  return serializedUser;
};

export default UpdateUserService;
