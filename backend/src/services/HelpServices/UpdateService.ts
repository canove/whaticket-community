import AppError from "../../errors/AppError";
import Help from "../../models/Help";

interface Data {
  id: number | string;
  title: string;
  description?: string;
  video?: string;
  link?: string;
}

const UpdateService = async (data: Data): Promise<Help> => {
  const { id } = data;

  const record = await Help.findByPk(id);

  if (!record) {
    throw new AppError("ERR_NO_HELP_FOUND", 404);
  }

  await record.update(data);

  return record;
};

export default UpdateService;
