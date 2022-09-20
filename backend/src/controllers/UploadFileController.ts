import { Request, Response } from "express";
import formidable from "formidable";
import { getIO } from "../libs/socket";
import CreateUploadFileService from "../services/UploadFileService/CreateUploadFileService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const form = formidable({ multiples: false });
  const { companyId } = req.user;

  return form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json("occured an error");
    if (!files) return res.status(500).json("file is expected");

    const filePath = files.file.filepath;

    const { ownerid, name, official, whatsappIds, templateId } = fields;

    const file = await CreateUploadFileService({
      name,
      ownerid,
      official,
      whatsappIds,
      filePath,
      companyId,
      templateId
    });

    const io = getIO();
    io.emit(`file${companyId}`, {
      action: "create",
      file
    });

    return res.status(200).json(file);
  });
};
