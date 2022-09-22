import Pricing from "../../database/models/Pricing";

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
    graceTrigger
  });

  return pricing;
};

export default CreatePricingService;
