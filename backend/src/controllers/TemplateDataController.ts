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

  return form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json("occured an error");
    if (!files) return res.status(500).json("file is expected");

    const { name, bodies, footer } = fields;

    const text = [];

    if (bodies) {
      if (Array.isArray(bodies)) {
        for (const body of bodies) {
          const index = body.charAt(body.length - 1);
          let bodyValue = body;
          bodyValue = bodyValue.slice(0, -1);
          const bodyJSON = JSON.parse(bodyValue);
          text[index] = bodyJSON;
        }
      } else {
        const index = bodies.charAt(bodies.length - 1);
        let bodyValue = bodies;
        bodyValue = bodyValue.slice(0, -1);
        const bodyJSON = JSON.parse(bodyValue);
        text[index] = bodyJSON;
      }
    }

    const allFiles = files.file;

    if (allFiles) {
      if (Array.isArray(allFiles)) {
        for (const file of allFiles) {
          const filePath = file.filepath;
          const buffer = await fs.readFileSync(filePath);
          const [fileName, fileType, index] = file.originalFilename.split("/");

          const fileLink = await uploadToS3(fileName, companyId, buffer);
          text[index] = { type: fileType, value: fileLink };
        }
      } else {
        const filePath = allFiles.filepath;
        const buffer = await fs.readFileSync(filePath);
        const [fileName, fileType, index] =
          allFiles.originalFilename.split("/");

        const fileLink = await uploadToS3(fileName, companyId, buffer);
        text[index] = { type: fileType, value: fileLink };
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
  const form = formidable({ multiples: true });

  const { templatesId } = req.params;
  const { companyId } = req.user;

  return form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json("occured an error");
    if (!files) return res.status(500).json("file is expected");

    const { name, bodies, footer } = fields;

    const text = [];

    if (bodies) {
      if (Array.isArray(bodies)) {
        for (const body of bodies) {
          const index = body.charAt(body.length - 1);
          let bodyValue = body;
          bodyValue = bodyValue.slice(0, -1);
          const bodyJSON = JSON.parse(bodyValue);
          text[index] = bodyJSON;
        }
      } else {
        const index = bodies.charAt(bodies.length - 1);
        let bodyValue = bodies;
        bodyValue = bodyValue.slice(0, -1);
        const bodyJSON = JSON.parse(bodyValue);
        text[index] = bodyJSON;
      }
    }

    const allFiles = files.file;

    if (allFiles) {
      if (Array.isArray(allFiles)) {
        for (const file of allFiles) {
          const filePath = file.filepath;
          const buffer = await fs.readFileSync(filePath);
          const [fileName, fileType, index] = file.originalFilename.split("/");

          const fileLink = await uploadToS3(fileName, companyId, buffer);
          text[index] = { type: fileType, value: fileLink };
        }
      } else {
        const filePath = allFiles.filepath;
        const buffer = await fs.readFileSync(filePath);
        const [fileName, fileType, index] =
          allFiles.originalFilename.split("/");

        const fileLink = await uploadToS3(fileName, companyId, buffer);
        text[index] = { type: fileType, value: fileLink };
      }
    }

    const templatesData = { name, footer, text: JSON.stringify(text) };

    const template = await UpdateTemplateDataService({
      templatesId,
      templatesData
    });

    const io = getIO();
    io.emit(`templates${companyId}`, {
      action: "update",
      template
    });

    return res.status(200).json(template);
  });
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
};
