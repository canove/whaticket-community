import * as Yup from "yup";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import TenantHelper from "../../helpers/TenantHelper";

interface Request {
  tagId: string | number;
  name: string;
  color: string;
  description?: string;
  tenantId: number;
}

const UpdateTagService = async ({
  tagId,
  name,
  color,
  description,
  tenantId
}: Request): Promise<Tag> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(2),
    color: Yup.string().required().matches(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i, "Cor deve ser um hex válido")
  });

  try {
    await schema.validate({ name, color });
  } catch (err) {
    throw new AppError(err.message);
  }

  const tag = await Tag.findOne({
    where: TenantHelper.createTenantWhere({ id: tagId }, tenantId)
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  // Verifica se já existe uma tag com o mesmo nome no tenant (exceto a atual)
  const existingTag = await Tag.findOne({
    where: TenantHelper.createTenantWhere({ 
      name,
      id: { [Symbol.for('sequelize.ne')]: tagId }
    }, tenantId)
  });

  if (existingTag) {
    throw new AppError("ERR_TAG_DUPLICATED", 400);
  }

  await tag.update({
    name,
    color,
    description: description || ""
  });

  return tag;
};

export default UpdateTagService;