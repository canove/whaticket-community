import Historic from "../../database/models/Historic";

interface Request {
  userId: number | string;
  systemChange: number;
  update: any;
  registerId: number | string;
  actionType: number | string;
}

const CreateHistoricService = async ({
  userId,
  systemChange,
  update,
  registerId,
  actionType
}: Request): Promise<void> => {
  const allHistorics = await Historic.findAll({
    where: { systemChange, registerId },
    order: [["createdAt", "ASC"]]
  });

  let lastHistoric = null;
  if (allHistorics.length > 0) {
    lastHistoric = allHistorics[allHistorics.length - 1];
  }

  const current = JSON.stringify(update);

  await Historic.create({
    createdBy: userId,
    systemChange,
    currentJSON: lastHistoric && lastHistoric.updatedJSON,
    updatedJSON: current,
    registerId,
    actionType
  });
};

export default CreateHistoricService;

/*
    System Change:
        0 -> Product
        1 -> Pricing

    Action Type:
        0 -> Create
        1 -> Edit
        2 -> Delete
*/
