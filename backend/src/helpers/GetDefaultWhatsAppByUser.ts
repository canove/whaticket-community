import User from "../models/User";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

const GetDefaultWhatsAppByUser = async (
  userId: number
): Promise<Whatsapp | null> => {
  const user = await User.findByPk(userId, { include: ["whatsapp"] });
  if (user === null) {
    return null;
  }

  if (user.whatsapp !== null) {
    logger.info(
      `Found whatsapp linked to user '${user.name}' is '${user.whatsapp.name}'.`
    );
  }

  return user.whatsapp;
};

export default GetDefaultWhatsAppByUser;
