import { Op, Sequelize } from "sequelize";
import BatchIntegrations from "../../database/models/BatchIntegrations";
import FileRegister from "../../database/models/FileRegister";

const ListBatchesService = async (companyId: number): Promise<BatchIntegrations[]> => {
    let batches = await BatchIntegrations.findAll({
        where: { companyId },
        order: [["createdAt", "DESC"]]
    });

    let updatingBatch = false;
    const processingBatches = batches.filter(batch => (batch.batchQuantity !== batch.processedQuantity));
    for (const batch of processingBatches) {
        const processed_count = await FileRegister.count({ 
            where: { batchId: batch.batchId, processedAt: { [Op.ne]: null }, companyId } 
        });
    
        const interaction_count = await FileRegister.count({ 
            where: { batchId: batch.batchId, interactionAt: { [Op.ne]: null }, companyId } 
        });
    
        await batch.update({ processedQuantity: processed_count, interactionQuantity: interaction_count });

        updatingBatch = true;
    }

    if (updatingBatch) {
        batches = await BatchIntegrations.findAll({
            where: { companyId },
            order: [["createdAt", "DESC"]]
        });
    }

    return batches;
};

export default ListBatchesService;
