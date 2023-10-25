import TicketNote from "../../models/TicketNote";

const FindAllTicketNotesService = async (): Promise<TicketNote[]> => {
  const ticketNote = await TicketNote.findAll();
  return ticketNote;
};

export default FindAllTicketNotesService;
