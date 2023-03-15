import { SerializeUser } from "../../helpers/SerializeUser";
import ShowCompanyService from "../CompanyService/ShowCompanyService";
import ShowProfileService from "../ProfileServices/ShowProfileService";
import ShowUserService from "./ShowUserService";

interface Request {
  userId: string | number;
  language: string;
  companyId: string | number;
}

interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
}

const UpdateUserLanguageService = async ({
  userId,
  language,
  companyId
}: Request): Promise<Response | undefined> => {
  const user = await ShowUserService(userId, companyId);

  await user.update({
    lang: language
  });

  await user.reload();

  let serializedUser = SerializeUser(user);
  
  const company = await ShowCompanyService(user.companyId);
  const profiles = await ShowProfileService(`${user.profileId}`, user.companyId);

  serializedUser = { ...serializedUser, company, profiles };

  return serializedUser;
};

export default UpdateUserLanguageService;
