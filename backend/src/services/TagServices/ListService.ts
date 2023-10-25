import { Op, literal, fn, col } from "sequelize";
import Tag from "../../models/Tag";
import Ticket from "../../models/Ticket";
import TicketTag from "../../models/TicketTag";

interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  tags: Tag[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  companyId,
  searchParam,
  pageNumber = "1"
}: Request): Promise<Response> => {
  let whereCondition = {};
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  if (searchParam) {
    whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${searchParam}%` } },
        { color: { [Op.like]: `%${searchParam}%` } }
      ]
    };
  }

  const { count, rows: tags } = await Tag.findAndCountAll({
    where: { ...whereCondition, companyId },
    limit,
    offset,
    order: [["name", "ASC"]],
    subQuery: false,
    include: [{
      model: TicketTag,
      as: 'ticketTags',
      attributes: [],
      required: false
    }],
    attributes: [
      'id',
      'name',
      'color',
      [fn('count', col('ticketTags.tagId')), 'ticketsCount']
    ],
    group: ['Tag.id']
  });

  const hasMore = count > offset + tags.length;

  return {
    tags,
    count,
    hasMore
  };
};

export default ListService;
