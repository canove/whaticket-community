import Company from "../../database/models/Company";
import Packages from "../../database/models/Packages";
import Pricing from "../../database/models/Pricing";
import Product from "../../database/models/Products";

const ListPricingsService = async (): Promise<Pricing[]> => {
  const pricing = await Pricing.findAll({
    include: [
      {
        model: Product,
        as: "product",
        attributes: ["name", "monthlyFee", "triggerFee"],
        required: false
      },
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

  return pricing;
};

export default ListPricingsService;
