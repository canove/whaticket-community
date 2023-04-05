import Pricing from "../../database/models/Pricing";
import ShowPricingService from "./ShowPricingService";

interface Request {
  companyId: number;
  productId: number;
  gracePeriod: number;
  graceTrigger: number;
  packageId: number;
}

const CreatePricingService = async ({
  companyId,
  productId,
  gracePeriod,
  graceTrigger,
  packageId
}: Request): Promise<Pricing> => {
  const pricing = await Pricing.create({
    companyId,
    productId: productId ? productId : null,
    gracePeriod,
    graceTrigger,
    usedGraceTriggers: 0,
    packageId: packageId ? packageId : null,
  });

  const createdPricing = await ShowPricingService(pricing.id);

  return createdPricing;
};

export default CreatePricingService;
