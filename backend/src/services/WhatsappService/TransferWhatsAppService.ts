import * as Yup from "yup";
import { Op } from "sequelize";

import AppError from "../../errors/AppError";
import Whatsapp from "../../database/models/Whatsapp";
import ShowWhatsAppService from "./ShowWhatsAppService";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";
import { getIO } from "../../libs/socket";
import Queue from "../../database/models/Queue";
import Company from "../../database/models/Company";

interface TransferData {
  whatsapps: string[];
  company: string;
}

interface Request {
  transferData: TransferData;
}

const TransferWhatsAppService = async ({
  transferData,
}: Request): Promise<void> => {
  const { whatsapps, company } = transferData;

  whatsapps.forEach(async whatsId => {
    const whats = await Whatsapp.findOne({
      where: {
        id: whatsId
      }
    });

    if (!whats) {
      throw new Error("Whats Not Found");
    }
    
    const oldCompanyId = whats.companyId;

    await whats.update({
      companyId: company,
      connectionFileId: null
    });

    const whatsapp = await Whatsapp.findOne({
      where: {
        id: whatsId
      },
      include: [
        {
          model: Queue,
          as: "queues",
          attributes: ["id", "name", "color", "greetingMessage"]
        },
        {
          model: Company,
          as: "company",
          attributes: ["id", "name"]
        }
      ],
      order: [["status", "DESC"]]
    });

    const io = getIO();
    io.emit(`whatsapp${company}`, {
      action: "update",
      whatsapp
    });

    io.emit(`whatsapp${oldCompanyId}`, {
      action: "delete",
      whatsappId: whatsapp.id
    });

    io.emit(`whatsapp1`, {
      action: "update",
      whatsapp
    });
  });
};

export default TransferWhatsAppService;
