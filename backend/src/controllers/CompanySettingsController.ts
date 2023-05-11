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
    const { days, hours, message, useWorkTime, allowedIPs } = req.body;
  
    try {
        const client = createClient({
            url: process.env.REDIS_URL
        });
    
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
    
        await client.set(`settings-${companyId}`, JSON.stringify({ days, hours, message, useWorkTime, allowedIPs }));
    
        await client.disconnect();
    } catch (err: any) {
        throw new AppError(err);
    }

    return res.status(200).json(companyId);
};
