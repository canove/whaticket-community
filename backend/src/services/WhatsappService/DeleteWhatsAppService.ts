import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

const DeleteWhatsApprService = async (id: string): Promise<void> => {
  const whatsapp = await Whatsapp.findOne({
    where: { id }
  });

  if (!whatsapp) {
    throw new AppError("No whatsapp found with this ID.", 404);
  }

  await whatsapp.destroy();
};

export default DeleteWhatsApprService;
