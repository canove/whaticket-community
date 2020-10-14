import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

const DeleteWhatsApprService = async (id: string): Promise<void> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id }
  });

  if (!whatsapp) {
    throw new AppError("ERR_NO_WAPP_FOUND", 404);
  }

  await whatsapp.destroy();
};

export default DeleteWhatsApprService;
