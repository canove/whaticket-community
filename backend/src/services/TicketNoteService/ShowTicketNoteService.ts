import TicketNote from "../../models/TicketNote";
import AppError from "../../errors/AppError";

const ShowTicketNoteService = async (
  id: string | number
): Promise<TicketNote> => {
  const ticketNote = await TicketNote.findByPk(id);

  if (!ticketNote) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  return ticketNote;
};

export default ShowTicketNoteService;
