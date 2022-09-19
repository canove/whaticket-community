import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import ListFileService from "../services/FileService/ListFileService";
import UpdateFileService from "../services/UploadFileService/UpdateFileService";

type IndexQuery = {
  Status: number;
  initialDate: string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { Status, initialDate } = req.query as unknown as IndexQuery;
  const companyId = req.user.companyId;

  const report = await ListFileService({
    Status,
    initialDate,
    companyId
  });

  return res.status(200).json(report);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fileId } = req.params;
  const { status, userId } = req.query;

  const file = await UpdateFileService({ status, userId, fileId });

  const io = getIO();
  io.emit("file", {
    action: "update",
    file
  });

  return res.status(200).json(file);
}
