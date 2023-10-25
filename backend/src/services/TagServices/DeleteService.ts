import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

const DeleteService = async (id: string | number): Promise<void> => {
  const tag = await Tag.findOne({
    where: { id }
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  await tag.destroy();
};

export default DeleteService;
