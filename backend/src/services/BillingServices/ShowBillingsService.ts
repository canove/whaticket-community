import Billings from "../../database/models/Billings";

const ShowBillingsService = async (
  billingId: number | string
): Promise<Billings> => {
  const billing = await Billings.findByPk(billingId);

  return billing;
};

export default ShowBillingsService;
