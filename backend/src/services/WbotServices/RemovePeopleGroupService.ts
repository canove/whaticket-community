import AppError from "../../errors/AppError";
// import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
// import { getWbot } from "../../libs/wbot";

const RemovePeopleGroupService = async (
  peoples: string[],
  wbot: any
): Promise<void> => {
  try {
    await wbot.removeParticipants(peoples);
  } catch (err) {
    if (err.message === "invalidNumber") {
      throw new AppError("ERR_WAPP_INVALID_CONTACT");
    }
    // throw new AppError("ERR_WAPP_CHECK_CONTACT");
    // console.log(err.message);
  }
};

export default RemovePeopleGroupService;
