import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";

interface Request {
  tags: Tag[];
  ticketId: number;
}

const SyncTags = async ({
  tags,
  ticketId
}: Request): Promise<Ticket | null> => {
  const ticket = await Ticket.findByPk(ticketId, { include: [Tag] });

  const tagList = tags.map(t => ({ tagId: t.id, ticketId }));

  await TicketTag.destroy({ where: { ticketId } });
  await TicketTag.bulkCreate(tagList);

  ticket?.reload();

  return ticket;
};

export default SyncTags;
