import Pricing from "../../database/models/Pricing";
import AppError from "../../errors/AppError";

const DeletePricingService = async (id: string | number): Promise<Pricing> => {
  const pricing = await Pricing.findOne({
    where: { id }
  });

  if (!pricing) {
    throw new AppError("ERR_NO_PRICING_FOUND", 404);
  }

  await pricing.update({
    deletedAt: new Date()
  });

  pricing.reload();

  return pricing;

  // await pricing.destroy();
};

export default DeletePricingService;
