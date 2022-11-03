import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";
import ShowConnectionFileByNameService from "../ConnectionFileService/ShowConnectionFileByNameService";

interface Request {
  companyId: string | number;
  official: string | boolean;
  pageNumber: string | number;
  connectionFileName?: string;
}

interface Response {
  whatsapps: Whatsapp[];
  count: number;
  hasMore: boolean;
  connectionFileId: number | null;
}

const ListWhatsAppsService = async ({
  companyId,
  official,
  connectionFileName,
  pageNumber = 1
}: Request): Promise<Response> => {
  const isOfficial = official === "true";

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  let connectionFile = null;
  if (connectionFileName && connectionFileName !== "No Category") {
    connectionFile = await ShowConnectionFileByNameService(
      connectionFileName,
      companyId
    );
  }

  const { count, rows: whatsapps } = await Whatsapp.findAndCountAll({
    where: {
      official: isOfficial,
      companyId,
      deleted: false,
      connectionFileId: connectionFile ? connectionFile.id : null
    },
    limit,
    offset,
    include: [
      {
        model: Queue,
        as: "queues",
        attributes: ["id", "name", "color", "greetingMessage"]
      }
    ],
    order: [["status", "DESC"]]
  });

  const hasMore = count > offset + whatsapps.length;

  return {
    whatsapps,
    count,
    hasMore,
    connectionFileId: connectionFile ? connectionFile.id : null
  };
};

export default ListWhatsAppsService;
