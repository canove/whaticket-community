import Help from "../../models/Help";

const FindAllService = async (): Promise<Help[]> => {
  const records: Help[] = await Help.findAll({
    order: [["title", "ASC"]]
  });
  return records;
};

export default FindAllService;
