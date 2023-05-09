import BatchIntegrations from "../../database/models/BatchIntegrations";

const ListBatchesService = async (companyId: number): Promise<BatchIntegrations[]> => {
    const batches = await BatchIntegrations.findAll({
        where: { companyId }
    });

    return batches;
};

export default ListBatchesService;
