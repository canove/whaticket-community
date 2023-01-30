import ConnectionFiles from "../../database/models/ConnectionFile";
import Whatsapp from "../../database/models/Whatsapp";

const GetConnectedWhatsAppsService = async (companyId: number): Promise<Whatsapp[]> => {
  const whatsapps = await Whatsapp.findAll({
    where: {
      deleted: false,
      official: false,
      status: "CONNECTED",
      companyId: companyId
    },
    include: [
      {
        model: ConnectionFiles,
        as: "connectionFile",
        attributes: ["triggerInterval"],
        required: false
      }
    ],
  });

  return whatsapps;
};

export default GetConnectedWhatsAppsService;
