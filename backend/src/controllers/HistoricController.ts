import { Request, Response } from "express";
import ShowHistoricService from "../services/HistoricServices/ShowHistoricService";

type Query = {
  systemChange: number | string;
  registerId: number | string;
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { systemChange, registerId } = req.query as Query;

  const historics = await ShowHistoricService({ systemChange, registerId });

  return res.status(200).json(historics);
};
