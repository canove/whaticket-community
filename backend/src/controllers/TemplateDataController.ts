/*eslint-disable*/

import { Request, Response } from "express";
import formidable from "formidable";
import fs from "fs";
import AWS from "aws-sdk";
import ListTemplateDataService from "../services/TemplateDataService/ListTemplateDataService";
import CreateTemplateDataService from "../services/TemplateDataService/CreateTemplateDataService";
import UpdateTemplateDataService from "../services/TemplateDataService/UpdateTemplateDataService";
import DeleteTemplateDataService from "../services/TemplateDataService/DeleteTemplateDataService";
import ShowTemplateDataService from "../services/TemplateDataService/ShowTemplateDataService";
import { getIO } from "../libs/socket";
import ShowCompanyService from "../services/CompanyService/ShowCompanyService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { templates, count, hasMore } = await ListTemplateDataService({
    searchParam,
    pageNumber,
    companyId
  });

  return res.json({ templates, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const form = formidable({ multiples: true });

  const { companyId } = req.user;

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json("occured an error");
    if (!files) return res.status(500).json("file is expected");

    const { name, bodies, types, footer } = fields;

    let text = []

    if (bodies) {
      text = JSON.parse(bodies);
    }

    for (const file of files.file) {
      const filePath = file.filepath;
      const buffer = await fs.readFileSync(filePath);
      const fileLink = await uploadToS3(file.originalFilename, companyId, buffer);

      for (const type of types) {
        if (type.file === file.originalFilename) {
          text.push({type: type.type, value: fileLink});
        }
      }
    }

    const template = await CreateTemplateDataService({
      name,
      text,
      footer,
      companyId
    });

    const io = getIO();
    io.emit(`templates${companyId}`, {
      action: "create",
      template
    });

    return res.status(200).json(template);
  });
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { templatesId } = req.params;

  const response = await ShowTemplateDataService(templatesId);

  return res.status(200).json(response);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { templatesId } = req.params;
  const templatesData = req.body;
  const { companyId } = req.user;

  const response = await UpdateTemplateDataService({
    templatesId,
    templatesData
  });

  const io = getIO();
  io.emit(`templates${companyId}`, {
    action: "update",
    response
  });

  return res.status(200).json(response);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  await DeleteTemplateDataService(templateId);

  const io = getIO();
  io.emit(`templates${companyId}`, {
    action: "delete",
    templateId
  });

  return res.status(200).json({ message: "Template deleted" });
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
    console.log("ocorreu um erro ao tentar enviar o arquivo para o s3", err);
    console.log(
      "ocorreu um erro ao tentar enviar o arquivo para o s3",
      JSON.stringify(err)
    );
  }
}
