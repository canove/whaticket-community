import Announcement from "../../models/Announcement";

const FindAllService = async (): Promise<Announcement[]> => {
  const records: Announcement[] = await Announcement.findAll({
    order: [["createdAt", "DESC"]]
  });
  return records;
};

export default FindAllService;
