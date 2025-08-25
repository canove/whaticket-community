import Tag from "../../models/Tag";
import TenantHelper from "../../helpers/TenantHelper";

interface Request {
  tenantId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  tags: Tag[];
  count: number;
  hasMore: boolean;
}

const ListTagsService = async ({
  tenantId,
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const whereCondition = TenantHelper.createTenantWhere(
    searchParam
      ? {
          name: {
            [Symbol.for('sequelize.like')]: `%${searchParam.toLowerCase()}%`
          }
        }
      : {},
    tenantId
  );

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tags } = await Tag.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    include: ["tenant"]
  });

  const hasMore = count > offset + tags.length;

  return {
    tags,
    count,
    hasMore
  };
};

export default ListTagsService;