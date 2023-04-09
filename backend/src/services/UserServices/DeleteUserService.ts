import AppError from "../../errors/AppError";
import UpdateDeletedUserOpenTicketsStatus from "../../helpers/UpdateDeletedUserOpenTicketsStatus";
import QuickAnswer from "../../models/QuickAnswer";
import Ticket from "../../models/Ticket";
import User from "../../models/User";

const DeleteUserService = async (id: string | number): Promise<void> => {
  const user = await User.findOne({
    where: { id },
    include: [{ model: QuickAnswer }]
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

  await user.$remove("quickAnswers", user.quickAnswers);
  await user.destroy();
};

export default DeleteUserService;
