import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";

interface Request {
  key: string;
  value: string;
  companyId: number;
}

const UpdateSettingService = async ({
  key,
  value,
  companyId
}: Request): Promise<Setting | undefined> => {
  const [setting] = await Setting.findOrCreate({
    where: {
      key,
      companyId
    }, 
    defaults: {
      key,
      value,
      companyId
    }
  });

  if (setting != null && setting?.companyId !== companyId) {
    throw new AppError("Não é possível consultar registros de outra empresa");
  }

  if (!setting) {
    throw new AppError("ERR_NO_SETTING_FOUND", 404);
  }

  await setting.update({ value });

  return setting;
};

export default UpdateSettingService;
