import Campaign from "../../models/Campaign";

const FindAllService = async (): Promise<Campaign[]> => {
  const records: Campaign[] = await Campaign.findAll({
    order: [["name", "ASC"]]
  });
  return records;
};

export default FindAllService;
