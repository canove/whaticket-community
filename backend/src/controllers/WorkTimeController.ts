import { Request, Response } from "express";
import { createClient } from "redis";
import AppError from "../errors/AppError";

export const index = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;

    let value = null

    try {
        const client = createClient({
            url: process.env.REDIS_URL
        });

        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();

        value = await client.get(`work-time-${companyId}`);

        await client.disconnect();
    } catch (err: any) {
        throw new AppError(err);
    }

    if (!value) value = { days: [], hours: "", message: "", useWorkTime: false };

    return res.status(200).json(value);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const { companyId } = req.user;
    const { days, hours, message, useWorkTime } = req.body;
  
    try {
        const client = createClient({
            url: process.env.REDIS_URL
        });
    
        client.on('error', err => console.log('Redis Client Error', err));
        await client.connect();
    
        await client.set(`work-time-${companyId}`, JSON.stringify({ days, hours, message, useWorkTime }));
    
        await client.disconnect();
    } catch (err: any) {
        throw new AppError(err);
    }

    return res.status(200).json(companyId);
};
