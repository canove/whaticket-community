import BillingControls from "../../database/models/BillingControls";

const ShowBillingsHistoricService = async (
  billingId: number | string
): Promise<BillingControls[]> => {
  const billings = await BillingControls.findAll({
    where: { billingId }
  });

  return billings;
};

export default ShowBillingsHistoricService;
