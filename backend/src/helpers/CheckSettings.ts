import Setting from "../models/Setting";
import AppError from "../errors/AppError";

const CheckSettings = async (key: string): Promise<string> => {
  const setting = await Setting.findOne({
    where: { key }
  });

  if (!setting) {
    throw new AppError("ERR_NO_SETTING_FOUND", 404);
  }

  return setting.value;
};

export default CheckSettings;
