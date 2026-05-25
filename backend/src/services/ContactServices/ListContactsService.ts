import { Op } from "sequelize";
import Contact from "../../models/Contact.js";

interface Request {
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const trimmed = searchParam.trim();

  const whereCondition = trimmed
    ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${trimmed}%` } },
          { number: { [Op.iLike]: `%${trimmed}%` } }
        ]
      }
    : {};

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + contacts.length;

  return {
    contacts,
    count,
    hasMore
  };
};

export default ListContactsService;
