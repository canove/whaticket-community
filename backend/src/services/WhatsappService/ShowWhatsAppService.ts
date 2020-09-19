import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

const ShowWhatsAppService = async (
  id: string
): Promise<Whatsapp | undefined> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id }
  });

  if (!whatsapp) {
    throw new AppError("No whatsapp found with this ID.", 404);
  }

  return whatsapp;
};

export default ShowWhatsAppService;
