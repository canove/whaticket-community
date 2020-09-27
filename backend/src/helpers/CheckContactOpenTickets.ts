import { Op } from "sequelize";
import AppError from "../errors/AppError";
import Ticket from "../models/Ticket";

const CheckContactOpenTickets = async (contactId: number): Promise<void> => {
  const ticket = await Ticket.findOne({
    where: { contactId, status: { [Op.or]: ["open", "pending"] } }
  });

  if (ticket) {
    throw new AppError(
      "There's already an open or pending ticket for this contact."
    );
  }
};

export default CheckContactOpenTickets;
