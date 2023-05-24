import { Op } from "sequelize";

import BatchIntegrations from "../../database/models/BatchIntegrations";
import FileRegister from "../../database/models/FileRegister";

import AppError from "../../errors/AppError";

const UpdateBatchService = async (batchId: string, companyId: number): Promise<BatchIntegrations> => {
    const batch = await BatchIntegrations.findOne({
        where: { id: batchId, companyId }
    });

    if (!batch) throw new AppError("ERR_BATCH_NOT_FOUND");

    const count = await FileRegister.count({ 
        where: { batchId: batch.batchId, processedAt: { [Op.ne]: null }, companyId } 
    });

    await batch.update({ processedQuantity: count });

    return batch;
};

export default UpdateBatchService;
