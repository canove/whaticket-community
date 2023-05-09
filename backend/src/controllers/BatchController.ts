import { Request, Response } from "express";

import ListBatchesService from "../services/BatchService/ListBatchesService";
import UpdateBatchService from "../services/BatchService/UpdateBatchService";
import { getIO } from "../libs/socket";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const batches = await ListBatchesService(companyId);

  return res.status(200).json(batches);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { batchId } = req.params;

  const batch = await UpdateBatchService(batchId, companyId);

  const io = getIO();
  io.emit(`batch${companyId}`, {
    action: "update",
    batch
  });

  return res.status(200).json(batch);
};
