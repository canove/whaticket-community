import Pricing from "../../database/models/Pricing";

const ListPricingsService = async (): Promise<Pricing[]> => {
  const pricing = await Pricing.findAll();

  return pricing;
};

export default ListPricingsService;
