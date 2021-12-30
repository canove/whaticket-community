import AppError from "../../errors/AppError";
import Setting from "../../models/Setting";

interface Response {
  key: string;
  value: string;
}
const ListSettingByKeyService = async (
  value: string
): Promise<Response | undefined> => {
  const settings = await Setting.findOne({
    where: { value }
  });

  if (!settings) {
    throw new AppError("ERR_NO_API_TOKEN_FOUND", 404);
  }

  return { key: settings.key, value: settings.value };
};

export default ListSettingByKeyService;
