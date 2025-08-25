import { Request, Response } from "express";

import ListDistributionService from "../services/DistributionService/ListDistributionService";
import CreateOrUpdateDistributionService from "../services/DistributionService/CreateOrUpdateDistributionService";


export const createOrUpdate = async (req: Request, res: Response) => {
  const { queueId } = req.params;
  const { enabled } = req.body;
  const distribution = await CreateOrUpdateDistributionService({ queueId: Number(queueId), enabled });
  return res.status(200).json(distribution);
};

export const index = async (req: Request, res: Response) => {
  const { queueId } = req.params;
  if (queueId) {
    const distributions = await ListDistributionService({ queueId: Number(queueId) });
    return res.status(200).json(distributions);
  }
  const distributions = await ListDistributionService();
  return res.status(200).json(distributions);
}

