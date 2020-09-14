import User from "../models/User";
import AppError from "../errors/AppError";

const FindUserService = async (id: string): Promise<User | undefined> => {
  const user = await User.findOne({
    where: { id },
    attributes: ["name", "id", "email", "profile"]
  });

  if (!user) {
    throw new AppError("No user found with this ID.", 404);
  }

  return user;
};

export default FindUserService;
