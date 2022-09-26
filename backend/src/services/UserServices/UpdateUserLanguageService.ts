import AppError from "../../errors/AppError";
import ShowUserService from "./ShowUserService";

interface Request {
  userId: string | number;
  language: string;
}

interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
}

const UpdateUserLanguageService = async ({
  userId,
  language
}: Request): Promise<Response | undefined> => {
  const user = await ShowUserService(userId);

  await user.update({
    lang: language
  });

  await user.reload();

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile,
    queues: user.queues,
    lang: user.lang,
    companyId: user.companyId
  };

  return serializedUser;
};

export default UpdateUserLanguageService;
