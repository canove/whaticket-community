import User from "../../database/models/User";
import AppError from "../../errors/AppError";
import Queue from "../../database/models/Queue";
import Profiles from "../../database/models/Profiles";

const ShowUserService = async (
  id: string | number,
  companyId: string | number
): Promise<User> => {
  let whereCondition = null;

  whereCondition = { id }

  if (companyId !== 1) whereCondition = { ...whereCondition, companyId }

  const user = await User.findOne({
    where: whereCondition,
    attributes: [
      "name",
      "id",
      "email",
      "profile",
      "profileId",
      "tokenVersion",
      "lang",
      "companyId"
    ],
    include: [
      { model: Queue, as: "queues", attributes: ["id", "name", "color"] },
      { model: Profiles, as: "profiles", attributes: ["id", "name", "permissions", "menus"] }
    ],
    order: [[{ model: Queue, as: "queues" }, "name", "asc"]]
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  return user;
};

export default ShowUserService;
