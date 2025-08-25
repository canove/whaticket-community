import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import TenantHelper from "../../helpers/TenantHelper";

interface Request {
  tagId: string | number;
  tenantId: number;
}

const DeleteTagService = async ({ tagId, tenantId }: Request): Promise<void> => {
  const tag = await Tag.findOne({
    where: TenantHelper.createTenantWhere({ id: tagId }, tenantId)
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  await tag.destroy();
};

export default DeleteTagService;