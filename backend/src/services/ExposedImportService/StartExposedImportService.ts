import { Op } from "sequelize";
import ExposedImport from "../../database/models/ExposedImport";
import AppError from "../../errors/AppError";

interface Request {
    exposedImportId: string;
    companyId: number;
    payload: any;
}

const StartExposedImportService = async ({
    exposedImportId,
    companyId,
    payload
}: Request): Promise<Response> => {
    const exposedImport = await ExposedImport.findOne({
        where: {
            id: exposedImportId,
            companyId,
            deletedAt: { [Op.is]: null }
        }
    });

    if (!exposedImport) {
        throw new AppError("ERR_NO_IMPORT_FOUND", 404)
    }

    return payload;
};

export default StartExposedImportService;
