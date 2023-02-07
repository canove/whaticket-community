/*eslint-disable*/
import FileRegister from "../../database/models/FileRegister";
import { Op, Sequelize } from "sequelize"
import File from "../../database/models/File";
import { FileStatus } from "../../enum/FileStatus";
import sequelize from "../../database";
import { endOfDay, parseISO, startOfDay } from "date-fns";

interface Request {
  fileId?: string;
  date?: string;
  initialDate?: string;
  finalDate?: string;
  companyId: number
}

const ListRegistersService = async ({
  fileId,
  date,
  companyId, 
  initialDate, 
  finalDate
}: Request) => {
  let whereCondition = null;

  whereCondition = {
    ...whereCondition,
    companyId
  }

  if (fileId) {
    whereCondition = {
      ...whereCondition,
      fileId
    }
  } else {
    const files = await File.findAll({
      where: { 
        [Op.or]: [
          { status: 7 },
          { status: 2 }, 
        ],
        companyId
      }
    });

    if (files.length > 0) {
      const filesArray = files.map(file => file.id);
      whereCondition = {
        ...whereCondition,
        fileId: { [Op.notIn]: filesArray }
      }
    }
  }

  if (date) {
    whereCondition = {
      ...whereCondition,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      },
    }
  }

  if (initialDate && finalDate) {
    const i = new Date(+startOfDay(parseISO(initialDate)));
    const f = new Date(+endOfDay(parseISO(finalDate)));

    const thirtyDays = 31 * 24 * 60 * 60 * 1000; // dia * horas * minutos * segundos * milisegundos

    if (!(f.getTime() - i.getTime() >= thirtyDays)) {
      whereCondition = {
        ...whereCondition,
        createdAt: {
          [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
        },
      };
    }
  }

  const totalAmount = await FileRegister.findOne({
    where: whereCondition,
    attributes: [
      [ Sequelize.fn('count', Sequelize.col("FileRegister.id")), 'total' ],
      [ Sequelize.fn('sum', Sequelize.literal("sentAt IS NOT NULL AND msgWhatsId IS NOT NULL")), 'sent' ],
      [ Sequelize.fn('sum', Sequelize.literal("deliveredAt IS NOT NULL")), 'delivered' ],
      [ Sequelize.fn('sum', Sequelize.literal("readAt IS NOT NULL")), 'read' ],
      [ Sequelize.fn('sum', Sequelize.literal("errorAt IS NOT NULL")), 'error' ],
      [ Sequelize.fn('sum', Sequelize.literal("interactionAt IS NOT NULL")), 'interaction' ],
      [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NOT NULL AND (haveWhatsapp = 0 OR msgWhatsId IS NULL)")), 'noWhats' ],
      [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NULL")), 'queue' ],
    ],
    raw: true
  });

  return totalAmount;
};

export default ListRegistersService;
