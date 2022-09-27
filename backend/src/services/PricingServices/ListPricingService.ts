import Company from "../../database/models/Company";
import Pricing from "../../database/models/Pricing";
import Product from "../../database/models/Products";

const ListPricingsService = async (): Promise<Pricing[]> => {
  const pricing = await Pricing.findAll({
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["name", "monthlyFee", "triggerFee"],
        required: true
      },
      {
        model: Company,
        as: "company",
        attributes: ["name", "status"],
        required: true
      }
    ]
  });

  return pricing;
};

export default ListPricingsService;
