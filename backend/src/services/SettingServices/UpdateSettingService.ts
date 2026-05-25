import Setting from "../../models/Setting.js";

interface Request {
  key: string;
  value: string;
}

const UpdateSettingService = async ({
  key,
  value
}: Request): Promise<Setting | undefined> => {
  const [setting] = await Setting.findOrCreate({
    where: { key },
    defaults: { key, value } as any
  });

  await setting.update({ value });

  return setting;
};

export default UpdateSettingService;
