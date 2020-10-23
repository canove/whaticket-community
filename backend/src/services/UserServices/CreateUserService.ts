import * as Yup from "yup";

import AppError from "../../errors/AppError";
import User from "../../models/User";

interface Request {
  email: string;
  password: string;
  name: string;
  profile?: string;
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
  profile = "admin"
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
          const emailExists = await User.findOne({
            where: { email: value! }
          });
          return !emailExists;
        }
      ),
    password: Yup.string().required().min(5)
  });

  try {
    await schema.validate({ email, password, name });
  } catch (err) {
    throw new AppError(err.message);
  }

  const user = await User.create({
    email,
    password,
    name,
    profile
  });

  const serializedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    profile: user.profile
  };

  return serializedUser;
};

export default CreateUserService;
