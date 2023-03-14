import { Op, Sequelize } from "sequelize";
import FileRegister from "../../database/models/FileRegister";
import { endOfDay, parseISO, startOfDay, subHours } from "date-fns";

interface Request {
  statuses?: Array<any>;
  fileIds?: Array<any>;
  pageNumber?: string | number;
  companyId: number;
  initialDate: string;
  finalDate: string;
  name: string;
  phoneNumber: string;
  limit: string;
}

interface Response {
  registers: FileRegister[];
  count: number;
  hasMore: boolean;
}

const ListReportRegistersService = async ({
  statuses,
  fileIds,
  pageNumber = "1",
  companyId,
  initialDate,
  finalDate,
  name = "",
  phoneNumber = "",
  limit = "20"
}: Request): Promise<Response> => {
  let whereCondition = null;

  whereCondition = { companyId };

  if (name) {
    whereCondition = {
      ...whereCondition,
      "$FileRegister.name$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("FileRegister.name")),
        "LIKE",
        `%${name.toLowerCase()}%`
      )
    }
  }

  if (phoneNumber) {
    whereCondition = {
      ...whereCondition,
      "$FileRegister.phoneNumber$": Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("FileRegister.phoneNumber")),
        "LIKE",
        `%${phoneNumber.toLowerCase()}%`
      )
    }
  }

  if (fileIds) {
    whereCondition = {
      ...whereCondition,
      fileId: fileIds
    };
  }

  if (statuses) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: getStatuses(statuses)
    };
  }

  if (initialDate && finalDate) {
    whereCondition = {
      ...whereCondition,
      processedAt: {
        [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
      },
    }
  }

  const offset = +limit * (+pageNumber - 1);

  const { count, rows: registers } = await FileRegister.findAndCountAll({
    where: whereCondition,
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? offset : null
  });

  const hasMore = count > offset + registers.length;

  return { registers, count, hasMore };
};

const getStatuses = (statuses) => {
  const array = [];

  if (statuses.includes("sent")) {
    array.push({ sentAt: { [Op.ne]: null } });
  }

  if (statuses.includes("delivered")) {
    array.push({ deliveredAt: { [Op.ne]: null } });
  }

  if (statuses.includes("read")) {
    array.push({ readAt: { [Op.ne]: null } });
  }

  if (statuses.includes("error")) {
    array.push({ errorAt: { [Op.ne]: null } });
  }

  if (statuses.includes("interaction")) {
    array.push({ interactionAt: { [Op.ne]: null } });
  }

  return array;
};

export default ListReportRegistersService;
