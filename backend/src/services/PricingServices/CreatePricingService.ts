import Pricing from "../../database/models/Pricing";
import ShowPricingService from "./ShowPricingService";

interface Request {
  companyId: number;
  productId: number;
  gracePeriod: number;
  graceTrigger: number;
}

const CreatePricingService = async ({
  companyId,
  productId,
  gracePeriod,
  graceTrigger
}: Request): Promise<Pricing> => {
  const pricing = await Pricing.create({
    companyId,
    productId,
    gracePeriod,
    graceTrigger,
    usedGraceTriggers: 0
  });

  const createdPricing = await ShowPricingService(pricing.id);

  return createdPricing;
};

export default CreatePricingService;
