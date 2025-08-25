import User from "../../models/User";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import UpdateDeletedUserOpenTicketsStatus from "../../helpers/UpdateDeletedUserOpenTicketsStatus";
import UserQueue from "../../models/UserQueue";

const DeleteUserService = async (id: string | number): Promise<void> => {
  const user = await User.findOne({
    where: { id }
  });

  if (!user) {
    throw new AppError("ERR_NO_USER_FOUND", 404);
  }

  const userOpenTickets: Ticket[] = await user.$get("tickets", {
    where: { status: "open" }
  });

  if (userOpenTickets.length > 0) {
    UpdateDeletedUserOpenTicketsStatus(userOpenTickets);
  }
  await UserQueue.destroy({ where: { userId: id } });

  await user.destroy();
};

export default DeleteUserService;
