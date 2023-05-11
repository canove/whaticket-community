/*eslint-disable*/
import FileRegister from "../../database/models/FileRegister";
import { Op, Sequelize } from "sequelize"
import File from "../../database/models/File";
import { FileStatus } from "../../enum/FileStatus";
import sequelize from "../../database";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import Company from "../../database/models/Company";
import Whatsapp from "../../database/models/Whatsapp";
import WhatsappsConfig from "../../database/models/WhatsappsConfig";
import ConnectionFiles from "../../database/models/ConnectionFile";
import BillingControls from "../../database/models/BillingControls";
import Pricing from "../../database/models/Pricing";
import Product from "../../database/models/Products";
import Packages from "../../database/models/Packages";

interface Request {
    companyId?: string;
    initialDate?: string;
    finalDate?: string;
}

const ListOperationsService = async ({
  companyId,
  initialDate,
  finalDate
}: Request) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let whereCondition = null;

    whereCondition = {
        status: "ativo"
    }

    if (companyId) {
        whereCondition = {
            ...whereCondition,
            id: companyId
        }
    }

    const companies = await Company.findAll({
        where: whereCondition,
        attributes: ["id", "name"],
        include: [
            {
                model: Whatsapp,
                as: "whatsapps",
                attributes: ["id", "name"],
                required: false,
                where: {
                    official: false,
                    deleted: false,
                    status: "CONNECTED",
                },
                include: [
                    {
                        model: ConnectionFiles,
                        as: "connectionFile",
                        attributes: ["triggerInterval"],
                        required: false
                    }
                ],
            },
            {
                model: WhatsappsConfig,
                as: "config",
                attributes: ["triggerInterval"],
                required: false,
                where: {
                    active: true
                }
            },
            {
                model: BillingControls,
                as: "billingControls",
                attributes: ["usedGraceTriggers", "triggerFee", "quantity"],
                required: false,
                where: { 
                    "$billingControls.month$": Sequelize.where(Sequelize.fn("MONTH", Sequelize.col("billingControls.createdAt")), month.toString()),
                    "$billingControls.year$": Sequelize.where(Sequelize.fn("YEAR", Sequelize.col("billingControls.createdAt")), year.toString()),
                },
            },
            {
                model: Pricing,
                as: "pricing",
                attributes: ["id"],
                required: false,
                include: [
                    {
                        model: Product,
                        as: "product",
                        attributes: ["monthlyFee"],
                        required: false,
                    },
                    {
                        model: Packages,
                        as: "package",
                        attributes: ["monthlyFee"],
                        required: false,
                    },
                ]
            }
        ],
    });

    let response = [];

    for (const company of companies) {
        let whereConditionFileRegister = null;

        whereConditionFileRegister = {
            companyId: company.id
        }
        
        const files = await File.findAll({
            where: { 
                [Op.or]: [
                    { status: 7 },
                    { status: 2 }, 
                ],
                companyId: company.id
            }
        });
      
        if (files.length > 0) {
            const filesArray = files.map(file => file.id);
            whereConditionFileRegister = {
              ...whereConditionFileRegister,
              fileId: { [Op.notIn]: filesArray },
            }
        }

        if (initialDate && finalDate) {
            const i = new Date(+startOfDay(parseISO(initialDate)));
            const f = new Date(+endOfDay(parseISO(finalDate)));
        
            const thirtyDays = 31 * 24 * 60 * 60 * 1000;
        
            if (!(f.getTime() - i.getTime() >= thirtyDays)) {
                whereConditionFileRegister = {
                    ...whereConditionFileRegister,
                    createdAt: {
                        [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
                    },
                };
            }
        } else if (initialDate) {
            whereConditionFileRegister = {
                ...whereConditionFileRegister,
                createdAt: {
                    [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(initialDate))]
                },
            };
        } else if (finalDate) {
            whereConditionFileRegister = {
                ...whereConditionFileRegister,
                createdAt: {
                    [Op.between]: [+startOfDay(parseISO(finalDate)), +endOfDay(parseISO(finalDate))]
                },
            };
        }

        const fileRegisters = await FileRegister.findOne({
            where: whereConditionFileRegister,
            attributes: [
              [ Sequelize.fn('count', Sequelize.col("FileRegister.id")), 'total' ],
              [ Sequelize.fn('sum', Sequelize.literal("(sentAt IS NOT NULL AND msgWhatsId IS NOT NULL) OR (fileId IS NULL AND exposedImportId IS NULL AND integratedImportId IS NULL)")), 'sent' ],
              [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NOT NULL AND (haveWhatsapp = 0 OR msgWhatsId IS NULL)")), 'noWhats' ],
              [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NULL")), 'queue' ],
            ],
            raw: true
        });

        response.push({ company, fileRegisters });
    }

    return response;
};

export default ListOperationsService;
