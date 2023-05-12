import { Request, Response } from "express";
import formidable from "formidable";
import AWS from "aws-sdk";
import fs from "fs";
import { getIO } from "../libs/socket";

import CreateCompanyService from "../services/CompanyService/CreateCompanyService";
import ListCompanyService from "../services/CompanyService/ListCompanyService";
import UpdateCompanyService from "../services/CompanyService/UpdateCompanyService";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";
import DeleteCompanyService from "../services/CompanyService/DeleteCompanyService";
import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  if (companyId !== 1) throw new AppError("NO_PERMISSION");

  const { companies, count, hasMore } = await ListCompanyService({
    searchParam,
    pageNumber
  });

  return res.json({ companies, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { alias, name, cnpj, phone, email, address, logo, onlyOwnedMessages } = req.body;
  const { companyId } = req.user;

  const company = await CreateCompanyService({
    alias,
    name,
    cnpj,
    phone,
    email,
    address,
    logo,
    onlyOwnedMessages
  });

  const io = getIO();
  io.emit(`company${companyId}`, {
    action: "create",
    company
  });

  return res.status(200).json(company);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;

  const company = await ShowCompanyService(companyId);

  return res.status(200).json(company);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.params;
  const companyData = req.body;
  const userCompanyId = req.user.companyId;

  const company = await UpdateCompanyService({ companyData, companyId });

  const io = getIO();
  io.emit(`company${userCompanyId}`, {
    action: "update",
    company
  });

  return res.status(200).json(company);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.params;
  const userCompanyId = req.user.companyId;

  await DeleteCompanyService(companyId);

  const io = getIO();
  io.emit(`company${userCompanyId}`, {
    action: "delete",
    companyId
  });

  return res.status(200).json({ message: "Company deleted" });
};

export const uploadLogoToS3 = async (req: Request, res: Response) => {
  const { companyId } = req.params;

  const companyData = await ShowCompanyService(companyId);
  const companyAlias = companyData.alias;

  const form = formidable({ multiples: false });

  return form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json("occured an error");
    if (!files) return res.status(500).json("file is expected");

    const filePath = files.file.filepath;

    const buffer = await fs.readFileSync(filePath);

    const { name } = fields;

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

      const company = await UpdateCompanyService({
        companyData: { ...companyData, logo: result },
        companyId
      });

      return res.status(200).json(company);
    } catch (err) {
      console.log("ocorreu um erro ao tentar enviar o arquivo para o s3", err);
      console.log(
        "ocorreu um erro ao tentar enviar o arquivo para o s3",
        JSON.stringify(err)
      );
    }
  });
};
