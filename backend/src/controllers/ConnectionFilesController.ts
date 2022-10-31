import { Request, Response } from "express";
import formidable from "formidable";
import AWS from "aws-sdk";
import fs from "fs";
import { getIO } from "../libs/socket";

import CreateConnectionFileService from "../services/ConnectionFileService/CreateConnectionFileService";
import ListConnectionFilesService from "../services/ConnectionFileService/ListConnectionFilesService";
import UpdateConnectionFileService from "../services/ConnectionFileService/UpdateConnectionFileService";
import ShowConnectionFileService from "../services/ConnectionFileService/ShowConnectionFileService";
import DeleteConnectionFileService from "../services/ConnectionFileService/DeleteConnectionFileService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const connectionFiles = await ListConnectionFilesService(companyId);

  return res.json(connectionFiles);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const form = formidable({ multiples: true });

  const { companyId } = req.user;

  return form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json("occured an error");

    let iconLink;

    const file = files.icon;

    if (file) {
      const filePath = file.filepath;
      const buffer = fs.readFileSync(filePath);
      const fileName = file.originalFilename;

      // eslint-disable-next-line no-use-before-define
      iconLink = await uploadToS3(fileName, companyId, buffer);
    }

    const { name, icon } = fields;

    const connectionFile = await CreateConnectionFileService({
      name,
      icon: file ? iconLink : icon,
      companyId
    });

    const io = getIO();
    io.emit(`connectionFile${companyId}`, {
      action: "create",
      connectionFile
    });

    return res.status(200).json(connectionFile);
  });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { connectionFileId } = req.params;
  const { companyId } = req.user;

  const connectionFile = await ShowConnectionFileService(
    connectionFileId,
    companyId
  );

  return res.status(200).json(connectionFile);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const form = formidable({ multiples: true });

  const { connectionFileId } = req.params;
  const { companyId } = req.user;

  return form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json("occured an error");

    let iconLink;

    const file = files.icon;

    if (file) {
      const filePath = file.filepath;
      const buffer = fs.readFileSync(filePath);
      const fileName = file.originalFilename;

      // eslint-disable-next-line no-use-before-define
      iconLink = await uploadToS3(fileName, companyId, buffer);
    }

    const { name, icon } = fields;

    const connectionFile = await UpdateConnectionFileService({
      connectionFileData: { name, icon: file ? iconLink : icon },
      connectionFileId,
      companyId
    });

    const io = getIO();
    io.emit(`connectionFile${companyId}`, {
      action: "update",
      connectionFile
    });

    return res.status(200).json(connectionFile);
  });
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { connectionFileId } = req.params;
  const { companyId } = req.user;

  await DeleteConnectionFileService(connectionFileId, companyId);

  const io = getIO();
  io.emit(`connectionFile${companyId}`, {
    action: "delete",
    connectionFileId
  });

  return res.status(200).json({ message: "Connection File Deleted" });
};

const uploadToS3 = async (name, companyId, buffer) => {
  const companyData = await ShowCompanyService(companyId);
  const companyAlias = companyData.alias;

  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    const dt = new Date();
    const fileName = `${dt.getTime()}_${name}`;
    const ext = name.split(".").pop();

    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: `${companyAlias}/${dt.getFullYear()}/${(dt.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${dt
        .getDate()
        .toString()
        .padStart(2, "0")}/${fileName}`,
      Body: buffer,
      ContentEncoding: "base64",
      ContentType: `image/${ext}`
    };

    const result = await new Promise<string>(resolve => {
      s3.upload(params, (err, data) => {
        resolve(data.Location);
      });
    });

    return result;
  } catch (err) {
    console.log(
      "ocorreu um erro ao tentar enviar o arquivo para o s3",
      JSON.stringify(err)
    );
  }
};
