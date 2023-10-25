import Baileys from "../../models/Baileys";
import AppError from "../../errors/AppError";

const ShowBaileysService = async (id: string | number): Promise<Baileys> => {
  const baileysData = await Baileys.findOne({
    where: {
      whatsappId: id
    }
  });

  if (!baileysData) {
    throw new AppError("ERR_NO_BAILEYS_DATA_FOUND", 404);
  }

  return baileysData;
};

export default ShowBaileysService;
