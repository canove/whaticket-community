import User from "../../models/User";
import AppError from "../../errors/AppError";
import Queue from "../../models/Queue";

const ShowUserService = async (id: string | number): Promise<User> => {
  const user = await User.findByPk(id, {
    attributes: ["name", "id", "email", "profile", "tokenVersion"],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] }
    ]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return user;
};

export default ShowUserService;
