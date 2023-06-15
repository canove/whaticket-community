/*eslint-disable*/
import FileRegister from "../../database/models/FileRegister";
import { Op, Sequelize } from "sequelize"
import File from "../../database/models/File";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import Company from "../../database/models/Company";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";

interface Request {
    initialDate?: string;
    finalDate?: string;
    companyIds?: string[];
}

const ListOperationsService = async ({
  initialDate,
  finalDate,
  companyIds
}: Request) => {
    if (!initialDate || !finalDate) throw new AppError("ERR_DATE_FILTER_REQUIRED");

    let whereCondition = null;

    whereCondition = {
        status: "ativo"
    }

    if (companyIds) {
        whereCondition = {
            ...whereCondition,
            id: companyIds
        }
    }

    const companies = await Company.findAll({
        where: whereCondition,
        attributes: ["id", "name"],
        include: [
            {
                model: Whatsapp,
                as: "whatsapps",
                attributes: ["id", "name", "status", "sleeping"],
                required: false,
                where: { official: false, deleted: false },
            },
        ],
        order: [["name", "ASC"]],
    });

    let response = [];

    for (const company of companies) {
        let whereCondition = null;
        let whereConditionCreatedAt = null;
        let whereConditionProcessedAt = null;

        whereCondition = { companyId: company.id };
        
        const files = await File.findAll({
            where: { 
                [Op.or]: [
                    { status: 7 },
                    { status: 2 }, 
                ],
                companyId: company.id,
                // updatedAt: { [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))] },
            },
            attributes: ["id"],
        });
      
        if (files.length > 0) {
            const filesArray = files.map(file => file.id);
            whereCondition = {
                ...whereCondition,
                fileId: { [Op.notIn]: filesArray },
            }
        }

        if (initialDate && finalDate) {
            const i = new Date(+startOfDay(parseISO(initialDate)));
            const f = new Date(+endOfDay(parseISO(finalDate)));
        
            const thirtyDays = 31 * 24 * 60 * 60 * 1000;
        
            if (!(f.getTime() - i.getTime() >= thirtyDays)) {
                whereConditionCreatedAt = {
                    ...whereCondition,
                    createdAt: {
                        [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
                    },
                };

                whereConditionProcessedAt = {
                    ...whereCondition,
                    processedAt: {
                        [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
                    },
                }
            }
        }

        const total = await FileRegister.count({
            where: whereConditionCreatedAt
        });

        const processed = await FileRegister.count({
            where: {
                ...whereConditionProcessedAt,
                [Op.or]: [
                    {
                        [Op.or]: [
                            {
                                sentAt: { [Op.ne]: null },
                                msgWhatsId: { [Op.ne]: null },
                            },
                            {
                                fileId: null,
                                exposedImportId: null,
                                integratedImportId: null,
                            },
                        ],
                    },
                    {
                        msgWhatsId: null,
                        processedAt: { [Op.ne]: null },
                        [Op.or]: [
                            { haveWhatsapp: false },
                            { haveWhatsapp: null },
                        ],
                    },
                ],
            }
        });

        const queue1 = await FileRegister.count({
            where: {
                ...whereCondition,
                processedAt: null,
                fileId: null,
            },
        });

        const queue2 = await FileRegister.count({
            where: {
                ...whereCondition,
                processedAt: null,
            },
            include: [
                {
                    model: File,
                    as: "file",
                    where: { status: 5 },
                    required: true,
                },
            ],
        });

        const queue = queue1 + queue2;

        const registers = { processed, total, queue };
        
        response.push({ company, registers });
    }

    return response;
};

export default ListOperationsService;
