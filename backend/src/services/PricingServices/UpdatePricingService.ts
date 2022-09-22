import Pricing from "../../database/models/Pricing";
import ShowPricingService from "./ShowPricingService";

interface ProductData {
  companyId: number;
  productId: number;
  gracePeriod: number;
  graceTrigger: number;
}

interface Request {
  pricingData: ProductData;
  pricingId: number | string;
}

const UpdatePricingService = async ({
  pricingData,
  pricingId
}: Request): Promise<Pricing> => {
  const pricing = await ShowPricingService(pricingId);

  const { companyId, productId, gracePeriod, graceTrigger } = pricingData;

  await pricing.update({
    companyId,
    productId,
    gracePeriod,
    graceTrigger
  });

  return pricing;
};

export default UpdatePricingService;
