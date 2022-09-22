import Pricing from "../../database/models/Pricing";
import AppError from "../../errors/AppError";

const DeletePricingService = async (id: string | number): Promise<void> => {
  const pricing = await Pricing.findOne({
    where: { id }
  });

  if (!pricing) {
    throw new AppError("ERR_NO_PRICING_FOUND", 404);
  }

  await pricing.destroy();
};

export default DeletePricingService;
