import Pricing from "../../database/models/Pricing";

interface Request {
  companyId: number;
  productId: number;
  gracePeriod: number;
}

const CreatePricingService = async ({
  companyId,
  productId,
  gracePeriod
}: Request): Promise<Pricing> => {
  const pricing = await Pricing.create({
    companyId,
    productId,
    gracePeriod
  });

  return pricing;
};

export default CreatePricingService;
