import { Request, Response } from "express";
import ShowHistoricService from "../services/HistoricServices/ShowHistoricService";

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { systemChange, registerId } = req.body;

  const pricings = await ShowHistoricService({ systemChange, registerId });

  return res.status(200).json(pricings);
};
