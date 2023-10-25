import AppError from "../../errors/AppError";
import TicketNote from "../../models/TicketNote";

interface TicketNoteData {
  note: string;
  id?: number | string;
}

const UpdateTicketNoteService = async (
  ticketNoteData: TicketNoteData
): Promise<TicketNote> => {
  const { id, note } = ticketNoteData;

  const ticketNote = await TicketNote.findByPk(id);

  if (!ticketNote) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  await ticketNote.update({
    note
  });

  return ticketNote;
};

export default UpdateTicketNoteService;
