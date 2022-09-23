import Company from "../../database/models/Company";
import Pricing from "../../database/models/Pricing";
import Product from "../../database/models/Products";

import AppError from "../../errors/AppError";

const ShowPricingService = async (id: string | number): Promise<Pricing> => {
  const pricing = await Pricing.findByPk(id, {
    include: [
      { model: Product, as: "product", attributes: ["name"], required: true },
      {
        model: Company,
        as: "company",
        attributes: ["name", "status"],
        required: true
      }
    ]
  });

  if (!pricing) {
    throw new AppError("ERR_NO_PRICING_FOUND", 404);
  }

  return pricing;
};

export default ShowPricingService;
