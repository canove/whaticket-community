import Billing from "../../database/models/Billings";
import Company from "../../database/models/Company";

const ListBillingsService = async (): Promise<Billing[]> => {
  const billings = await Billing.findAll({
    include: [
      { 
        model: Company, 
        as: "company", 
        attributes: ["name"], 
        required: true 
      },
    ]
  });

  return billings;
};

export default ListBillingsService;
