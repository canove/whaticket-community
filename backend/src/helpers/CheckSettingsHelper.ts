import AppError from "../errors/AppError";
import Setting from "../models/Setting";

const CheckSettings = async (key: string): Promise<string> => {
  const settingsRepository = getRepository(Setting);

  const setting = await settingsRepository.findOne({
    where: { key }
  });

  if (!setting) {
    throw new AppError("No setting found with this id.", 404);
  }

  return setting.value;
};

export default CheckSettings;
