import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

const ShowWhatsAppService = async (
  id: string | number
): Promise<Whatsapp | undefined> => {
  const whatsapp = await Whatsapp.findByPk(id);

  if (!whatsapp) {
    throw new AppError("No whatsapp found with this conditions.", 404);
  }

  return whatsapp;
};

export default ShowWhatsAppService;
