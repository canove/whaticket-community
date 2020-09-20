import Whatsapp from "../../models/Whatsapp";
import AppError from "../../errors/AppError";

interface WhereParams {
  id?: number;
  name?: string;
  isDefault?: boolean;
}

interface Request {
  where?: WhereParams;
}

const FindWhatsAppService = async ({
  where
}: Request): Promise<Whatsapp | undefined> => {
  const whereCondition = { ...where };

  const whatsapp = await Whatsapp.findOne({
    where: whereCondition
  });

  if (!whatsapp) {
    throw new AppError("No whatsapp found with this conditions.", 404);
  }

  return whatsapp;
};

export default FindWhatsAppService;
