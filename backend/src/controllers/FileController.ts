import { Request, Response } from "express";
import { getIO } from "../libs/socket";
import ListFileService from "../services/FileService/ListFileService";
import UpdateFileService from "../services/UploadFileService/UpdateFileService";

type IndexQuery = {
  status?: number;
  initialDate?: string;
  pageNumber?: string;
  refusedStatus?: number;
};

type UpdateQuery = {
  status: number | string;
  userId: number | string;
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { status, initialDate, pageNumber, refusedStatus } = req.query as IndexQuery;

  const { companyId } = req.user;

  const { reports, count, hasMore } = await ListFileService({
    status,
    initialDate,
    companyId,
    pageNumber,
    refusedStatus
  });

  return res.status(200).json({ reports, hasMore, count });
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { fileId } = req.params;
  const { status } = req.query as UpdateQuery;
  const { companyId, id } = req.user;

  const file = await UpdateFileService({
    status,
    userId: id,
    fileId,
    companyId
  });

  const io = getIO();
  io.emit(`file${companyId}`, {
    action: "update",
    file
  });

  return res.status(200).json(file);
};
