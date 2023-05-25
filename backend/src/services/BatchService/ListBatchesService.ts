import { Op, Sequelize } from "sequelize";
import BatchIntegrations from "../../database/models/BatchIntegrations";
import FileRegister from "../../database/models/FileRegister";

const ListBatchesService = async (companyId: number): Promise<BatchIntegrations[]> => {
    let batches = await BatchIntegrations.findAll({
        where: { companyId },
        include: [
            {
                model: FileRegister,
                as: "registers",
                attributes: [
                    [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NOT NULL")), 'processedQuantity' ],
                    [ Sequelize.fn('sum', Sequelize.literal("interactionAt IS NOT NULL")), 'interactionQuantity' ],
                ],
                required: true,
            },
        ],
        order: [["createdAt", "DESC"]]
    });

    return batches;

    // let batches = await BatchIntegrations.findAll({
    //     where: { companyId },
    //     order: [["createdAt", "DESC"]]
    // });

    // let updatingBatch = false;

    // const processingBatches = batches.filter(batch => (batch.batchQuantity !== batch.processedQuantity));
    // for (const batch of processingBatches) {
    //     const count = await FileRegister.count({ 
    //         where: { batchId: batch.batchId, processedAt: { [Op.ne]: null }, companyId } 
    //     });
    
    //     await batch.update({ processedQuantity: count });

    //     updatingBatch = true;
    // }

    // if (updatingBatch) {
    //     batches = await BatchIntegrations.findAll({
    //         where: { companyId },
    //         order: [["createdAt", "DESC"]]
    //     });
    // }

    // return batches;
};

export default ListBatchesService;
