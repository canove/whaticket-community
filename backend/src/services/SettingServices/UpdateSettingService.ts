import AppError from "../../errors/AppError";
import Setting from "../../database/models/Setting";

interface Request {
  key: string;
  value: string;
  companyId: string | number;
}

const UpdateSettingService = async ({
  key,
  value,
  companyId
}: Request): Promise<Setting | undefined> => {
  const setting = await Setting.findOne({
    where: { key, companyId }
  });

  if (!setting) {
    throw new AppError("ERR_NO_SETTING_FOUND", 404);
  }

  await setting.update({ value });

  return setting;
};

export default UpdateSettingService;
