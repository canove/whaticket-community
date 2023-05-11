import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import User from "../../database/models/User";
import ShowCompanyService from "../CompanyService/ShowCompanyService";
import ShowProfileService from "../ProfileServices/ShowProfileService";
import Profiles from "../../database/models/Profiles";

interface Request {
  email: string;
  password: string;
  name: string;
  queueIds?: number[];
  profile?: string;
  profileId?: string;
  companyId: number | string;
  superAdmin?: boolean;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
}

const CreateUserService = async ({
  email,
  password,
  name,
  queueIds = [],
  profile = "admin",
  profileId,
  companyId,
  superAdmin = false
}: Request): Promise<Response> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    email: Yup.string()
      .email()
      .required()
      .test(
        "Check-email",
        "An user with this email already exists.",
        async value => {
          if (!value) return false;
          const emailExists = await User.findOne({
            where: { email: value, companyId, deletedAt: null }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate({ email, password, name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const user = await User.create(
    {
      email,
      password,
      name,
      profile,
      profileId,
      companyId,
      superAdmin
    },
    { include: ["queues"] }
  );

  await user.$set("queues", queueIds);

  await user.reload();

  let serializedUser = SerializeUser(user);

  if (companyId) {
    const company = await ShowCompanyService(companyId);
    const profiles = await ShowProfileService(`${user.profileId}`, companyId);

    serializedUser = { ...serializedUser, company, profiles };
  }

  return serializedUser;
};

export default CreateUserService;
