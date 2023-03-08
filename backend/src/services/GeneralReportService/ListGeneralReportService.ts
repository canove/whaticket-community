/*eslint-disable*/
import FileRegister from "../../database/models/FileRegister";
import { Op, Sequelize } from "sequelize"
import File from "../../database/models/File";
import { FileStatus } from "../../enum/FileStatus";
import sequelize from "../../database";
import { endOfDay, parseISO, startOfDay } from "date-fns";
import Company from "../../database/models/Company";
import Ticket from "../../database/models/Ticket";
import Message from "../../database/models/Message";
import CountMessagesServices from "../MessageServices/CountMessagesService";

interface Request {
  initialDate?: string;
  finalDate?: string;
  companyId: number
  company?: string;
}

const ListGeneralReportService = async ({
  companyId, 
  initialDate, 
  finalDate = "Arroz",
  company
}: Request) => {
    let whereConditionComp = null;
    let whereConditionReg = null;
    let whereConditionCreatedAt = null;
    let whereConditionProcessedAt = null;
    let whereConditionFiles = null;
    // let whereConditionMessage = "";

    whereConditionFiles = {
        ...whereConditionFiles,
        [Op.or]: [
            { status: 7 },
            { status: 2 }, 
        ]
    }

    if (company) {
        whereConditionComp = { id: company };
        whereConditionFiles = { ...whereConditionFiles, companyId: company };
    }

    const files = await File.findAll({
        attributes: ["id"],
        where: whereConditionFiles
    });

    if (files.length > 0) {
        const filesArray = files.map(file => file.id);

        whereConditionReg = {
            ...whereConditionReg,
            fileId: { [Op.notIn]: filesArray }
        }
    }

    if (initialDate && finalDate) {
        whereConditionCreatedAt = {
            ...whereConditionCreatedAt,
            createdAt: {
                [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
            },
        };

        // whereConditionMessage = `AND Messages.createdAt >= "${initialDate} 00:00:00" AND Messages.createdAt <= "${finalDate} 23:59:59"`;
    
        whereConditionProcessedAt = {
            ...whereConditionProcessedAt,
            processedAt: {
                [Op.between]: [+startOfDay(parseISO(initialDate)), +endOfDay(parseISO(finalDate))]
            },
        };
    }

    const registers1: any = await Company.findAll({
        where: whereConditionComp,
        attributes: [["id", "company_id"], "name"],
        include: [
            {
                model: FileRegister,
                as: "registers",
                attributes: [
                    [ Sequelize.fn('sum', Sequelize.literal("sentAt IS NOT NULL AND msgWhatsId IS NOT NULL")), 'sent' ],
                    [ Sequelize.fn('sum', Sequelize.literal("deliveredAt IS NOT NULL")), 'delivered' ],
                    [ Sequelize.fn('sum', Sequelize.literal("readAt IS NOT NULL")), 'read' ],
                    [ Sequelize.fn('sum', Sequelize.literal("errorAt IS NOT NULL")), 'error' ],
                    [ Sequelize.fn('sum', Sequelize.literal("interactionAt IS NOT NULL")), 'interaction' ],
                    [ Sequelize.fn('sum', Sequelize.literal("processedAt IS NOT NULL AND (haveWhatsapp = 0 OR msgWhatsId IS NULL)")), 'noWhats' ],
                ],
                where: { ...whereConditionReg, ...whereConditionProcessedAt },
                required: false,
            },
        ],
        group: "company_id",
        raw: true,
    });

    const registers2: any = await Company.findAll({
        where: whereConditionComp,
        attributes: [["id", "company_id"], "name"],
        include: [
            {
                model: FileRegister,
                as: "registers",
                attributes: [
                    [ Sequelize.fn('sum', Sequelize.literal("registers.createdAt IS NOT NULL")), 'total' ],
                ],
                where: { ...whereConditionReg, ...whereConditionCreatedAt },
                required: false,
            },
        ],
        group: "company_id",
        raw: true,
    });

    // const messages: any = await Company.findAll({
    //     where: whereConditionComp,
    //     attributes: [["id", "company_id"], "name"],
    //     include: [
    //         {
    //             model: Ticket,
    //             as: "tickets",
    //             attributes: [
    //                 [
    //                     Sequelize.literal(`(
    //                         SELECT COUNT(*)
    //                         FROM Tickets
    //                         INNER JOIN Messages
    //                         ON Messages.ticketId = Tickets.id
    //                         WHERE
    //                             Messages.fromMe = true AND
    //                             Tickets.companyId = company_id
    //                             ${whereConditionMessage}
    //                     )`),
    //                     'message_sent'
    //                 ],
    //                 [
    //                     Sequelize.literal(`(
    //                         SELECT COUNT(*)
    //                         FROM Tickets
    //                         INNER JOIN Messages
    //                         ON Messages.ticketId = Tickets.id
    //                         WHERE
    //                             Messages.fromMe = false AND
    //                             Tickets.companyId = company_id
    //                             ${whereConditionMessage}
    //                     )`),
    //                     'message_received'
    //                 ],
    //             ],
    //             required: false,
    //         }
    //     ],
    //     group: "company_id",
    //     raw: true,
    // });

    let report = [];

    for (let i = 0; i < registers1.length; i++) {
        const reg1 = registers1[i];
        const reg2 = registers2.find(r => r.company_id === reg1.company_id);
        
        const messages = await CountMessagesServices({ companyId: reg1.company_id, initialDate, finalDate });

        const message_sent = messages.sent;
        const message_received = messages.received;

        report.push({ ...reg1, ...reg2, message_sent, message_received });
    }

    return report;
};

export default ListGeneralReportService;
