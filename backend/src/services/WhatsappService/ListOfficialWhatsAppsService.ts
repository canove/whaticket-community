import Queue from "../../database/models/Queue";
import Whatsapp from "../../database/models/Whatsapp";

interface Request {
  companyId: string | number;
  official: string | boolean;
  pageNumber: string | number;
}

interface Response {
  whatsapps: Whatsapp[];
  count: number;
  hasMore: boolean;
}

const ListWhatsAppsService = async ({
  companyId,
  official,
  pageNumber = 1
}: Request): Promise<Response> => {
  let isOfficial = "";

  if (official === "true") {
    isOfficial = "1";
  } else {
    isOfficial = "0";
  }

  const limit = 10;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: whatsapps } = await Whatsapp.findAndCountAll({
    where: { official: isOfficial, companyId, deleted: false },
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
    hasMore
  };
};

export default ListWhatsAppsService;
