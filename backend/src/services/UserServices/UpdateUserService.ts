import * as Yup from "yup";

import AppError from "../../errors/AppError";
import ShowCompanyService from "../CompanyService/ShowCompanyService";
import ShowUserService from "./ShowUserService";

interface UserData {
  email?: string;
  password?: string;
  name?: string;
  profile?: string;
  profileId?: string;
  lang?: string;
  queueIds?: number[];
  companyId?: string | number;
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
  userCompanyId
}: Request): Promise<Response | undefined> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    email: Yup.string().email(),
    profile: Yup.string(),
    password: Yup.string()
  });

  const { email, password, profile, profileId, name, lang, queueIds = [] } = userData;
  let { companyId } = userData;

  if (userCompanyId !== 1) {
    companyId = userCompanyId;
  }

  const user = await ShowUserService(userId, companyId);

  try {
    await schema.validate({ email, password, profile, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  await user.update({
    email,
    password,
    profile,
    profileId,
    lang,
    name,
    companyId
  });

  await user.$set("queues", queueIds);

  await user.reload();

  const company = await ShowCompanyService(companyId);

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    profileId: user.profileId,
    queues: user.queues,
    companyId: user.companyId,
    company
  };

  return serializedUser;
};

export default UpdateUserService;
