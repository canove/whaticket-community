import Setting from "../../models/Setting";

const ListSettingsService = async (): Promise<Setting[] | undefined> => {
  const settings = await Setting.findAll();

  return settings;
};

export default ListSettingsService;
