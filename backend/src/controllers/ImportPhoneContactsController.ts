import { Request, Response } from "express";
import ImportContactsService from "../services/WbotServices/ImportContactsService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const userId:number = parseInt(req.user.id);
  const response = await ImportContactsService(userId, req.body);

  return res.status(200).json(response);
};
