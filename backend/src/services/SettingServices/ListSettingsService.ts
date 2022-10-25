import Setting from "../../database/models/Setting";

const ListSettingsService = async (
  companyId: number | string
): Promise<Setting[] | undefined> => {
  const settings = await Setting.findAll({ where: { companyId } });

  return settings;
};

export default ListSettingsService;
