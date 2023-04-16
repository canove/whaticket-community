import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";

const CreateGroupService = async (
  nameGroup: string,
  peoples: string[]
): Promise<string> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  try {
    // const isValidNumber = await wbot.isRegisteredUser(`${nameGroup}@c.us`);
    // console.log(typeof wbot.createGroup);
    const createGroup = await wbot.createGroup(nameGroup, peoples);
    // console.log(createGroup.gid);
    // if (!createGroup) {
    //   throw new AppError("invalidNumber");
    // }
    return createGroup.gid.user;
  } catch (err) {
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    // throw new AppError("ERR_WAPP_CHECK_CONTACT");
    console.log(err.message);
  }
};

export default CreateGroupService;
