import Whatsapp from "../../database/models/Whatsapp";

const CountConnectedWhatsAppsService = async (companyId: number): Promise<number> => {
  const count = await Whatsapp.count({
    where: {
      deleted: false,
      official: false,
      status: "CONNECTED",
    }
  });

  return count;
};

export default CountConnectedWhatsAppsService;
