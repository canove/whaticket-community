import { Sequelize } from "sequelize-typescript";
import { Op } from "sequelize";
import Templates from "../../database/models/TemplatesData";

interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  templatesId?: string | number;
  companyId: number;
}

interface Response {
  count: number;
  hasMore: boolean;
  templates: Templates[];
}

const ListTemplateDataService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  const whereCondition = {
    [Op.or]: [
      {
        "$name$": Sequelize.where(
          Sequelize.fn("LOWER", Sequelize.col("name")),
          "LIKE",
          `%${searchParam.toLowerCase().trim()}%`
        )
      },
      { name: { [Op.like]: `%${searchParam.toLowerCase().trim()}%` } }
    ],
    companyId
  };

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: templates } = await Templates.findAndCountAll({
    where: whereCondition,
    attributes: [
      "id",
      "name",
      "status",
      "text",
      "footer",
      "createdAt",
      "updatedAt",
    ],
    order: [["createdAt", "DESC"]],

  });

  const hasMore = count > offset + templates.length;

  return {
    templates,
    count,
    hasMore
  };
};

export default ListTemplateDataService;