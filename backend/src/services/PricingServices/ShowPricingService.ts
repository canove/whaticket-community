import Company from "../../database/models/Company";
import Packages from "../../database/models/Packages";
import Pricing from "../../database/models/Pricing";
import Product from "../../database/models/Products";

import AppError from "../../errors/AppError";

const ShowPricingService = async (id: string | number): Promise<Pricing> => {
  const pricing = await Pricing.findByPk(id, {
    include: [
      { model: Product, as: "product", attributes: ["name"], required: false },
      {
        model: Packages,
        as: "package",
        attributes: ["name"],
        required: false
      },
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
