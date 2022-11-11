/*eslint-disable*/
import FileRegister from "../../database/models/FileRegister";
import { Op, Sequelize } from "sequelize"
import File from "../../database/models/File";
import { FileStatus } from "../../enum/FileStatus";
import sequelize from "../../database";

interface Request {
  fileId?: number | string,
  date?: string,
  companyId: number
}

const getDate = (date: string, option: string) => {
  if (option === "MORNING") {
    let morningDate = new Date(`${date} GMT-3`);
    morningDate.setHours(0, 0, 0, 0);
    return morningDate;
  }

  if (option === "NIGHT") {
    let nightDate = new Date(`${date} GMT-3`);
    nightDate.setHours(23, 59, 59, 999);
    return nightDate;
  }
}

const ListRegistersService = async ({
  fileId,
  date,
  companyId
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
      where: { status: 7, companyId }
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
        [Op.gte]: getDate(date, "MORNING"),
        [Op.lte]: getDate(date, "NIGHT"),
      },
    }
  }

  const totalAmount = await FileRegister.findOne({
    where: whereCondition,
    attributes: [
      [ Sequelize.fn('count', Sequelize.col("FileRegister.id")), 'total' ],
      [ Sequelize.fn('sum', Sequelize.literal("sentAt IS NOT NULL")), 'sent' ],
      [ Sequelize.fn('sum', Sequelize.literal("deliveredAt IS NOT NULL")), 'delivered' ],
      [ Sequelize.fn('sum', Sequelize.literal("readAt IS NOT NULL")), 'read' ],
      [ Sequelize.fn('sum', Sequelize.literal("errorAt IS NOT NULL")), 'error' ],
      [ Sequelize.fn('sum', Sequelize.literal("interactionAt IS NOT NULL")), 'interaction' ],
      [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NOT NULL AND msgWhatsId IS NULL")), 'noWhats' ],
    ],
    raw: true
  });

  return totalAmount;
};

export default ListRegistersService;
