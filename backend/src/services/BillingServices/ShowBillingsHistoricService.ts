import BillingControls from "../../database/models/BillingControls";

const ShowBillingsHistoricService = async (
  billingId: number | string
): Promise<BillingControls[]> => {
  const billings = await BillingControls.findAll({
    where: { billingId },
    order: [["fromDate", "ASC"]]
  });

  return billings;
};

export default ShowBillingsHistoricService;
