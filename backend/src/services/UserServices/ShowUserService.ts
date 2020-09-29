import User from "../../models/User";
import AppError from "../../errors/AppError";

const ShowUserService = async (
  id: string | number
): Promise<User | undefined> => {
  const user = await User.findByPk(id, {
    attributes: ["name", "id", "email", "profile", "tokenVersion"]
  });

  if (!user) {
    throw new AppError("No user found with this ID.", 404);
  }

  return user;
};

export default ShowUserService;
