import Historic from "../../database/models/Historic";

interface Request {
  systemChange: number | string;
  registerId: number | string;
}

const ShowHistoricService = async ({
  systemChange,
  registerId
}: Request): Promise<Historic[]> => {
  const historics = await Historic.findAll({
    where: { systemChange, registerId },
    order: [["createdAt", "ASC"]]
  });

  return historics;
};

export default ShowHistoricService;
