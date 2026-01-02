import Setting from "../models/Setting.js";
import AppError from "../errors/AppError.js";

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
