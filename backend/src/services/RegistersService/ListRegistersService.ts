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
  let whereConditionCreatedAt = null;
  let whereConditionProcessedAt = null;

  whereCondition = { ...whereCondition, companyId };

  if (fileId) {
    whereConditionCreatedAt = { ...whereConditionCreatedAt, fileId };
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

      whereConditionCreatedAt = {
        ...whereConditionCreatedAt,
        fileId: { [Op.notIn]: filesArray }
      }
    }
  }

  if (date) {
    whereConditionCreatedAt = {
      ...whereConditionCreatedAt,
      createdAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      },
    }

    whereConditionProcessedAt = {
      ...whereConditionProcessedAt,
      processedAt: {
        [Op.between]: [+startOfDay(parseISO(date)), +endOfDay(parseISO(date))]
      },
    }
  }

  if (initialDate && finalDate) {
    const i = new Date(+startOfDay(parseISO(initialDate)));
    const f = new Date(+endOfDay(parseISO(finalDate)));

    const thirtyDays = 31 * 24 * 60 * 60 * 1000; // dia * horas * minutos * segundos * milisegundos

    if (!(f.getTime() - i.getTime() >= thirtyDays)) {
      whereConditionCreatedAt = {
        ...whereConditionCreatedAt,
        createdAt: {
          [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
        },
      };

      whereConditionProcessedAt = {
        ...whereConditionProcessedAt,
        processedAt: {
          [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
        },
      };
    }
  }

  const info1 = await FileRegister.findOne({
    where: { ...whereCondition, ...whereConditionProcessedAt },
    attributes: [
      [ Sequelize.fn('sum', Sequelize.literal("sentAt IS NOT NULL AND msgWhatsId IS NOT NULL")), 'sent' ],
      [ Sequelize.fn('sum', Sequelize.literal("deliveredAt IS NOT NULL")), 'delivered' ],
      [ Sequelize.fn('sum', Sequelize.literal("readAt IS NOT NULL")), 'read' ],
      [ Sequelize.fn('sum', Sequelize.literal("errorAt IS NOT NULL")), 'error' ],
      [ Sequelize.fn('sum', Sequelize.literal("interactionAt IS NOT NULL")), 'interaction' ],
      [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NOT NULL AND haveWhatsapp = 0 AND msgWhatsId IS NULL")), 'noWhats' ],
    ],
    raw: true
  });

  const info2 = await FileRegister.findOne({
    where: { ...whereCondition, ...whereConditionCreatedAt },
    attributes: [
      [ Sequelize.fn('count', Sequelize.col("FileRegister.id")), 'total' ],
    ],
    raw: true
  });

  const info3 = await FileRegister.findOne({
    where: whereCondition,
    attributes: [
      [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NULL AND (fileId IS NULL OR EXISTS (SELECT status FROM Files WHERE Files.id = fileId AND Files.status = 5))")), 'queue' ],
    ],
    raw: true
  });

  return { ...info1, ...info2, ...info3 };
};

export default ListRegistersService;
