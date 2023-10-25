import Setting from "../../models/Setting";

interface Request {
  companyId: number;
}

const ListSettingsService = async ({
  companyId
}: Request): Promise<Setting[] | undefined> => {
  const settings = await Setting.findAll({
    where: {
      companyId
    }
  });

  return settings;
};

export default ListSettingsService;
