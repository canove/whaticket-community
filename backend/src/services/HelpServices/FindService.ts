import Help from "../../models/Help";

const FindService = async (): Promise<Help[]> => {
  const notes: Help[] = await Help.findAll({
    order: [["title", "ASC"]]
  });

  return notes;
};

export default FindService;
