import User from "../../models/User";
import AppError from "../../errors/AppError";

const DeleteUserService = async (id: string): Promise<void> => {
  const user = await User.findOne({
    where: { id }
  });

  if (!user) {
    throw new AppError("No user found with this ID.", 404);
  }

  await user.destroy();
};

export default DeleteUserService;
