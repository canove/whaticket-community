import { Request, Response } from "express";
import AppError from "../errors/AppError";
import { getIO } from "../libs/socket";
import axios from "axios";
import { Op } from "sequelize";
import Whatsapp from "../database/models/Whatsapp";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { connectionName, connectionId } = req.query;
  const { companyId } = req.user;

  const officialWhats = await Whatsapp.findOne({
    where: {
      [Op.or]: {
        name: connectionName ?? "",
        id: connectionId ?? "",
      },
      companyId
    }
  });

  if (!officialWhats) throw new AppError("ERR_CONNECTION_DO_NOT_EXISTS");

  const { whatsappAccountId, facebookAccessToken } = officialWhats;

  const { data } = await axios.get(
    `https://graph.facebook.com/v15.0/${whatsappAccountId}/phone_numbers?access_token=${facebookAccessToken}`
  );

  return res.status(200).json({ phoneNumbers: data.data });
};
