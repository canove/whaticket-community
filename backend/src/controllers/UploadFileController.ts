import { Request, Response } from "express";

import CreateUploadFileService from "../services/UploadFileService/CreateUploadFileService";


export const store = async (req: Request, res: Response): Promise<Response> => {
  const { id, name, ownerid, Status } = req.body;

  const user = await CreateUploadFileService({
    id,
    name,
    ownerid,
    Status,

  });

  return res.status(200).json(user);
};
