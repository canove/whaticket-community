import { Request, Response } from "express";

import CreateUploadFileService from "../services/UploadFileService/CreateUploadFileService";


export const store = async (req: Request, res: Response): Promise<Response> => {
  const { id, url, name, QtdeRegister, Status, initialDate, ownerid } = req.body;

  const user = await CreateUploadFileService({
    id,
    url,
    name,
    QtdeRegister,
    Status,
    initialDate,
    ownerid,

  });

  return res.status(200).json(user);
};
