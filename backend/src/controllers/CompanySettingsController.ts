import { Request, Response } from "express";
import { createClient } from "redis";
import AppError from "../errors/AppError";
import ListCompanySettingsService from "../services/SettingServices/ListCompanySettingsService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const settings = await ListCompanySettingsService(companyId);

  return res.status(200).json(settings);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const {
    days,
    hours,
    message,
    useWorkTime,
    allowedIPs,
    transferRequiredQueue,
    defaultSurvey,
    autoCloseTickets,
    createTicketInterval,
    autoCloseTicketStatus,
    overflowQueueId,
    createTicketWhatsappType,
  } = req.body;

  try {
    const client = createClient({
      url: process.env.REDIS_URL
    });

    client.on("error", err => console.log("Redis Client Error", err));
    await client.connect();

    const settings = {
      days,
      hours,
      message,
      useWorkTime,
      allowedIPs,
      transferRequiredQueue,
      defaultSurvey,
      autoCloseTickets,
      createTicketInterval,
      autoCloseTicketStatus,
      overflowQueueId,
      createTicketWhatsappType,
    };

    await client.set(`settings-${companyId}`, JSON.stringify(settings));

    await client.disconnect();
  } catch (err: any) {
    throw new AppError(err);
  }

  return res.status(200).json(companyId);
};
