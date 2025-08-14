import { Request, Response } from "express";
import ImportContactsService from "../services/WbotServices/ImportContactsService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const userId: number = parseInt(req.user.id, 10);
  await ImportContactsService(userId);

  return res.status(200).json({ message: "contacts imported" });
};
