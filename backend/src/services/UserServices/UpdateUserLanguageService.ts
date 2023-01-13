import ShowCompanyService from "../CompanyService/ShowCompanyService";
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

  const company = await ShowCompanyService(user.companyId);

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    profileId: user.profileId,
    queues: user.queues,
    lang: user.lang,
    companyId: user.companyId,
    company
  };

  return serializedUser;
};

export default UpdateUserLanguageService;
