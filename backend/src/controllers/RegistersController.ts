import { Request, Response } from "express";
import ListRegistersService from "../services/RegistersService/ListRegistersService";

type IndexQuery = {
  type: string,
  fileId: string,
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { type, fileId } = req.query as unknown as IndexQuery;

  const report = await ListRegistersService({ type:"", fileId });

  const register = await ListRegistersService ({ type:"register", fileId })

  const sent = await ListRegistersService ({ type:"sent", fileId })

  const delivered = await ListRegistersService ({ type:"delivered", fileId })

  const read = await ListRegistersService ({ type:"read", fileId })

  const error = await ListRegistersService ({ type:"error", fileId })

  return res.status(200).json({report, register, sent, delivered, read, error});
}
