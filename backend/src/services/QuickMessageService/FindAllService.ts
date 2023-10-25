import QuickMessage from "../../models/QuickMessage";

const FindAllService = async (): Promise<QuickMessage[]> => {
  const records: QuickMessage[] = await QuickMessage.findAll({
    order: [["shortcode", "ASC"]]
  });
  return records;
};

export default FindAllService;
