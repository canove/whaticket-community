import { Request, Response } from "express";
import formidable from "formidable";
import fs from "fs";
import CreateUploadFileService from "../services/UploadFileService/CreateUploadFileService";

export const store = async (req: Request, res: Response): Promise<Response> => {
  const form = formidable({ multiples: false });

 form.parse(req, async (err, fields, files) => {
    if (err)
      return res.status(500).json("occured an error");
    if (!files)
      return res.status(500).json("file is expected");

    const filePath = files.file.filepath;

    const { ownerid, name } = fields;

    const user = await CreateUploadFileService({
      name,
      ownerid,
      filePath
    });

    return res.status(200).json(user);
  });
  return res.status(200).json(null);
};
