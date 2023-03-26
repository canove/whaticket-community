/*eslint-disable*/
import { Op, Sequelize } from "sequelize"
import { endOfDay, format, parseISO, startOfDay } from "date-fns";
import GeneralReports from "../../database/models/GeneralReports";
import Company from "../../database/models/Company";

interface Request {
    initialDate?: string;
    finalDate?: string;
    company?: string | number;
    companyId?: number;
}

const ListGeneralReportService = async ({
    companyId,
    initialDate, 
    finalDate,
    company
}: Request) => {
    let whereCondition = null;

    if (companyId !== 1) company = companyId;

    if (company) {
        whereCondition = {
            ...whereCondition,
            companyId: company
        }
    }

    if (initialDate && finalDate) {
        const initial = parseISO(initialDate);
        initial.setDate(initial.getDate() + 1);

        const final = parseISO(finalDate);
        final.setDate(final.getDate() + 1);

        whereCondition = {
            ...whereCondition,
            createdAt: {
                [Op.between]: [+startOfDay(initial), +endOfDay(final)]
            },
        }
    }

    const reports = await GeneralReports.findAll({
        where: whereCondition,
        attributes: [
            "companyId",
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.imported")), 'imported' ],
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.sent")), 'sent' ],
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.delivered")), 'delivered' ],
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.read")), 'read' ],
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.error")), 'error' ],
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.interaction")), 'interaction' ],
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.noWhats")), 'noWhats' ],
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.sentMessages")), 'sentMessages' ],
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.receivedMessages")), 'receivedMessages' ],
            [ Sequelize.fn('sum', Sequelize.col("GeneralReports.blacklist")), 'blacklist' ],
        ],
        include: [
            {
                model: Company,
                as: "company",
                attributes: ["name"],
                required: true
            }
        ],
        group: "companyId"
    })

    return reports;
};

export default ListGeneralReportService;

    // let whereConditionComp = null;
    // let whereConditionReg = null;
    // let whereConditionCreatedAt = null;
    // let whereConditionProcessedAt = null;
    // let whereConditionFiles = null;

    // whereConditionFiles = {
    //     ...whereConditionFiles,
    //     [Op.or]: [
    //         { status: 7 },
    //         { status: 2 }, 
    //     ]
    // }

    // if (company) {
    //     whereConditionComp = { id: company };
    //     whereConditionFiles = { ...whereConditionFiles, companyId: company };
    // }

    // const files = await File.findAll({
    //     attributes: ["id"],
    //     where: whereConditionFiles
    // });

    // if (files.length > 0) {
    //     const filesArray = files.map(file => file.id);

    //     whereConditionReg = {
    //         ...whereConditionReg,
    //         fileId: { [Op.notIn]: filesArray }
    //     }
    // }

    // if (initialDate && finalDate) {
    //     whereConditionCreatedAt = {
    //         ...whereConditionCreatedAt,
    //         createdAt: {
    //             [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
    //         },
    //     };
    
    //     whereConditionProcessedAt = {
    //         ...whereConditionProcessedAt,
    //         processedAt: {
    //             [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
    //         },
    //     };
    // }

    // const registers1: any = await Company.findAll({
    //     where: whereConditionComp,
    //     attributes: [["id", "company_id"], "name"],
    //     include: [
    //         {
    //             model: FileRegister,
    //             as: "registers",
    //             attributes: [
    //                 [ Sequelize.fn('sum', Sequelize.literal("sentAt IS NOT NULL AND msgWhatsId IS NOT NULL")), 'sent' ],
    //                 [ Sequelize.fn('sum', Sequelize.literal("deliveredAt IS NOT NULL")), 'delivered' ],
    //                 [ Sequelize.fn('sum', Sequelize.literal("readAt IS NOT NULL")), 'read' ],
    //                 [ Sequelize.fn('sum', Sequelize.literal("errorAt IS NOT NULL")), 'error' ],
    //                 [ Sequelize.fn('sum', Sequelize.literal("interactionAt IS NOT NULL")), 'interaction' ],
    //                 [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NOT NULL AND (haveWhatsapp = 0 OR msgWhatsId IS NULL)")), 'noWhats' ],
    //             ],
    //             where: { ...whereConditionReg, ...whereConditionProcessedAt },
    //             required: false,
    //         },
    //     ],
    //     group: "company_id",
    //     raw: true,
    // });

    // const registers2: any = await Company.findAll({
    //     where: whereConditionComp,
    //     attributes: [["id", "company_id"], "name"],
    //     include: [
    //         {
    //             model: FileRegister,
    //             as: "registers",
    //             attributes: [
    //                 [ Sequelize.fn('sum', Sequelize.literal("registers.createdAt IS NOT NULL")), 'total' ],
    //             ],
    //             where: { ...whereConditionReg, ...whereConditionCreatedAt },
    //             required: false,
    //         },
    //     ],
    //     group: "company_id",
    //     raw: true,
    // });

    // let report = [];

    // for (let i = 0; i < registers1.length; i++) {
    //     const reg1 = registers1[i];
    //     const reg2 = registers2.find(r => r.company_id === reg1.company_id);
        
    //     const messages = await CountMessagesServices({ companyId: reg1.company_id, initialDate, finalDate });

    //     const message_sent = messages.sent;
    //     const message_received = messages.received;

    //     report.push({ ...reg1, ...reg2, message_sent, message_received });
    // }
