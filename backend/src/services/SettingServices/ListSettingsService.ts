import Setting from "../../database/models/Setting";
import { v4 as uuidv4 } from "uuid";

const ListSettingsService = async (
  companyId: number | string
): Promise<Setting[] | undefined> => {
  const settings = await Setting.findAll({ where: { companyId } });

  // if (settings.length === 0) {
  //   await Setting.create({
  //     companyId: companyId,
  //     key: "userApiToken",
  //     value: uuidv4()
  //   });
  // }

  return settings;
};

export default ListSettingsService;
