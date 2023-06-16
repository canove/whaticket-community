import { Op, Sequelize } from "sequelize";
import FileRegister from "../../database/models/FileRegister";
import { endOfDay, parseISO, startOfDay, subHours } from "date-fns";
import File from "../../database/models/File";
import ConnectionFiles from "../../database/models/ConnectionFile";
import Message from "../../database/models/Message";
import Ticket from "../../database/models/Ticket";
import Category from "../../database/models/Category";

interface Request {
  statuses?: Array<any>;
  fileIds?: Array<any>;
  pageNumber?: string | number;
  companyId: number;
  initialDate?: string;
  finalDate?: string;
  name?: string;
  phoneNumber?: string;
  limit?: string;
  categoryIds?: Array<any>;
  isProcessed?: string;
  varSearch?: string;
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
  limit = "20",
  categoryIds,
  isProcessed = "true",
  varSearch = "",
}: Request): Promise<Response> => {
  let whereCondition = null;
  let whereConditionCategory = null;

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
  } else {
    const files = await File.findAll({
      where: { 
        [Op.or]: [
          { status: 7 }, // Recusado
          { status: 2 }, // Esperando Aprovação
        ],
        companyId
      }
    });

    if (files.length > 0) {
      const filesArray = files.map(file => file.id);

      whereCondition = {
        ...whereCondition,
        [Op.or]: [
          { fileId: { [Op.notIn]: filesArray } },
          { fileId: null }
        ]
      }
    }
  }

  if (statuses) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: getStatuses(statuses)
    };
  }

  if (initialDate && finalDate) {
    if (isProcessed === "true") {
      whereCondition = {
        ...whereCondition,
        processedAt: {
          [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
        },
      }
    } else {
      whereCondition = {
        ...whereCondition,
        createdAt: {
          [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
        },
      }
    }
  }

  if (varSearch) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        { var1: { [Op.like]: `%${varSearch}%` } },
        { var2: { [Op.like]: `%${varSearch}%` } },
        { var3: { [Op.like]: `%${varSearch}%` } },
        { var4: { [Op.like]: `%${varSearch}%` } },
        { var5: { [Op.like]: `%${varSearch}%` } },
      ]
    }
  }

  if (categoryIds) {
    whereConditionCategory = {
      where: { id: categoryIds },
    }
  }

  const offset = +limit * (+pageNumber - 1);

  const { count, rows: registers } = await FileRegister.findAndCountAll({
    where: whereCondition,
    include: [
      {
        model: Message,
        as: "messageData",
        attributes: ["id", "ticketId"],
        include: [
          {
            model: Ticket,
            as: "ticket",
            attributes: ["id", "categoryId"],
            include: [
              {
                model: Category,
                as: "category",
                attributes: ["id", "name"],
                required: true,
                ...whereConditionCategory
              }
            ],
            required: true
          }
        ],
        required: categoryIds ? true: false,
      }
    ],
    limit: +limit > 0 ? +limit : null,
    offset: +limit > 0 ? offset : null,
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
