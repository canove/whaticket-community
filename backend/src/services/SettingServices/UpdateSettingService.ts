import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";

interface Request {
  key: string;
  value: string;
}

const UpdateSettingService = async ({
  key,
  value
}: Request): Promise<Setting | undefined> => {
  const setting = await Setting.findOne({
    where: { key }
  });

  if (!setting) {
    throw new AppError("No setting found with this ID.", 404);
  }

  await setting.update({ value });

  return setting;
};

export default UpdateSettingService;
