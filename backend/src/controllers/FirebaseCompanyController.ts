import { Request, Response } from "express";

interface CompanyFirebaseBody {
  connected: boolean;
  isFull: boolean;
  service: string;
}

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;

  return res.status(200).json([companyId]);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { connected, isFull, service }: CompanyFirebaseBody = req.body;
  const { companyId } = req.params;

  return res.status(200).json({ connected, isFull, service, companyId });
};
