import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

const TagService = async (id: string | number): Promise<Tag> => {
  const tag = await Tag.findByPk(id);

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  return tag;
};

export default TagService;
