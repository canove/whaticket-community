import Setting from "../../models/Setting.js";

const ListSettingsService = async (): Promise<Setting[] | undefined> => {
  const settings = await Setting.findAll();

  return settings;
};

export default ListSettingsService;
