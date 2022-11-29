import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import axios from "axios";
import { Op } from "sequelize";
import Whatsapp from "../database/models/Whatsapp";
import CreateOfficialWhatsappService from "../services/OfficialWhatsappServices/CreateOfficialWhatsappService";
import UpdateOfficialWhatsappService from "../services/OfficialWhatsappServices/UpdateOfficialWhatsappService";
import ListOfficialWhatsappService from "../services/OfficialWhatsappServices/ListOfficialWhatsappService";
import ShowOfficialWhatsappService from "../services/OfficialWhatsappServices/ShowOfficialWhatsappService";
import ShowByNameOfficialWhatsappService from "../services/OfficialWhatsappServices/ShowByNameOfficialWhatsappService";

// export const index = async (req: Request, res: Response): Promise<Response> => {
//   const { connectionName, connectionId } = req.query;
//   const { companyId } = req.user;

//   const officialWhats = await Whatsapp.findOne({
//     where: {
//       [Op.or]: {
//         name: connectionName ?? "",
//         id: connectionId ?? "",
//       },
//       companyId
//     }
//   });

//   if (!officialWhats) throw new AppError("ERR_CONNECTION_DO_NOT_EXISTS");

//   const { whatsappAccountId, facebookAccessToken } = officialWhats;

//   const { data } = await axios.get(
//     `https://graph.facebook.com/v15.0/${whatsappAccountId}/phone_numbers?access_token=${facebookAccessToken}`
//   );

//   return res.status(200).json({ phoneNumbers: data.data });
// };

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const officialWhatsapps = await ListOfficialWhatsappService(companyId);

  return res.status(200).json(officialWhatsapps);
}

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { officialWhatsappId } = req.params;

  const officialWhatsapp = await ShowOfficialWhatsappService(officialWhatsappId, companyId);

  return res.status(200).json(officialWhatsapp);
}

export const showByName = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { officialWhatsappName } = req.params;

  const officialWhatsapp = await ShowByNameOfficialWhatsappService(officialWhatsappName, companyId);

  return res.status(200).json(officialWhatsapp);
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { facebookAccessToken, name } = req.body;

  const officialWhatsapp = await CreateOfficialWhatsappService({
    companyId,
    name,
    facebookAccessToken,
  });

  const io = getIO();
  io.emit(`officialWhatsapp${companyId}`, {
    action: "create",
    officialWhatsapp
  });

  return res.status(200).json(officialWhatsapp);
}

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;
  const { name } = req.body;
  const { officialWhatsappId } = req.params;

  const officialWhatsapp = await UpdateOfficialWhatsappService({ name, officialWhatsappId, companyId });

  const io = getIO();
  io.emit(`officialWhatsapp${companyId}`, {
    action: "update",
    officialWhatsapp
  });

  return res.status(200).json(officialWhatsapp);
};
