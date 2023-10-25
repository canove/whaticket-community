import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";

interface Request {
  name: string;
  color: string;
  companyId: number;
}

const CreateService = async ({
  name,
  color = "#A4CCCC",
  companyId
}: Request): Promise<Tag> => {
  const schema = Yup.object().shape({
    name: Yup.string().required().min(3)
  });

  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const [tag] = await Tag.findOrCreate({
    where: { name, color, companyId },
    defaults: { name, color, companyId }
  });

  await tag.reload();

  return tag;
};

export default CreateService;
