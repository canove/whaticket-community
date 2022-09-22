import Pricing from "../../database/models/Pricing";
import AppError from "../../errors/AppError";

const ShowPricingService = async (id: string | number): Promise<Pricing> => {
  const pricing = await Pricing.findByPk(id);

  if (!pricing) {
    throw new AppError("ERR_NO_PRICING_FOUND", 404);
  }

  return pricing;
};

export default ShowPricingService;
