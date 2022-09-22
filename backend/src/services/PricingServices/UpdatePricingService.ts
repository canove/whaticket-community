import Pricing from "../../database/models/Pricing";
import ShowPricingService from "./ShowPricingService";

interface ProductData {
  companyId: number;
  productId: number;
  gracePeriod: number;
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

  const { companyId, productId, gracePeriod } = pricingData;

  await pricing.update({
    companyId,
    productId,
    gracePeriod
  });

  return pricing;
};

export default UpdatePricingService;
