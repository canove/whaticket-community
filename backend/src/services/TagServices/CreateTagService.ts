import * as Yup from "yup";
import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";
import TenantHelper from "../../helpers/TenantHelper";

interface Request {
  name: string;
  color: string;
  description?: string;
  tenantId: number;
}

const CreateTagService = async ({
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

  // Verifica se já existe uma tag com o mesmo nome no tenant
  const existingTag = await Tag.findOne({
    where: TenantHelper.createTenantWhere({ name }, tenantId)
  });

  if (existingTag) {
    throw new AppError("ERR_TAG_DUPLICATED", 400);
  }

  const tag = await Tag.create(
    TenantHelper.injectTenantData({
      name,
      color,
      description: description || ""
    }, tenantId)
  );

  return tag;
};

export default CreateTagService;