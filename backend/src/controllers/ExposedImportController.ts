import { Request, Response } from "express";

import ListExposedImportsService from "../services/ExposedImportService/ListExposedImportsService";
import CreateExposedImportService from "../services/ExposedImportService/CreateExposedImportService";
import ShowExposedImportService from "../services/ExposedImportService/ShowExposedImportService";
import UpdateExposedImportService from "../services/ExposedImportService/UpdateExposedImportService";
import DeleteExposedImportService from "../services/ExposedImportService/DeleteExposedImportService";
import StartExposedImportService from "../services/ExposedImportService/StartExposedImportService";

import { getIO } from "../libs/socket";
import TestRequiredExposedImportService from "../services/ExposedImportService/TestRequiredExposedImportService";

const AWS = require('aws-sdk');

type IndexQuery = {
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { pageNumber } = req.query as IndexQuery;
  const { companyId } = req.user;

  const { exposedImports, count, hasMore } = await ListExposedImportsService({
    companyId,
    pageNumber
  });

  return res.status(200).json({ exposedImports, count, hasMore });
};

interface ExposedImportData {
  name: string;
  mapping: string;
  template: string;
  connections: string[];
  requiredItems: string;
  connectionType: string | boolean;
  connectionFileId: string | number;
  connectionFileIds: string;
  officialTemplatesId: string | number;
  officialConnectionId: string | number;
}

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    mapping,
    template,
    connections,
    requiredItems,
    connectionType,
    connectionFileId,
    connectionFileIds,
    officialTemplatesId,
    officialConnectionId,
  }: ExposedImportData = req.body;

  const { companyId } = req.user;

  const exposedImport = await CreateExposedImportService({
    name,
    mapping,
    template,
    companyId,
    connections,
    requiredItems,
    connectionType,
    connectionFileId,
    connectionFileIds,
    officialTemplatesId,
    officialConnectionId,
  });

  const io = getIO();
  io.emit(`exposedImport${companyId}`, {
    action: "create",
    exposedImport
  });

  return res.status(200).json(exposedImport);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { exposedImportId } = req.params;
  const { companyId } = req.user;

  const exposedImport = await ShowExposedImportService(
    exposedImportId,
    companyId
  );

  return res.status(200).json(exposedImport);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const exposedImportData = req.body;
  const { exposedImportId } = req.params;
  const { companyId } = req.user;

  const exposedImport = await UpdateExposedImportService({
    exposedImportData,
    exposedImportId,
    companyId
  });

  const io = getIO();
  io.emit(`exposedImport${companyId}`, {
    action: "update",
    exposedImport
  });

  return res.status(200).json(exposedImport);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { exposedImportId } = req.params;
  const { companyId } = req.user;

  await DeleteExposedImportService(exposedImportId, companyId);

  const io = getIO();
  io.emit(`exposedImport${companyId}`, {
    action: "delete",
    exposedImportId
  });

  return res.status(200).json({ message: "Importation deleted" });
};

export const start = async (req: Request, res: Response): Promise<Response> => {
  const { exposedImportId } = req.params;
  const { companyId } = req.user;
  const payload = req.body;

  // const exposedImport = await StartExposedImportService({
  //   exposedImportId,
  //   companyId,
  //   payload
  // });

  // return res.status(200).json({ message: "success" }); 

  const response = await TestRequiredExposedImportService({ exposedImportId, companyId, payload });

  if (!response) {
    await sendSqs({
      MessageBody: JSON.stringify({ payload, exposedImportId, companyId }),
      QueueUrl: process.env.SQS_DISPATCH_QUEUE,
    });

    return res.status(200).json({ message: "request was received with success" }); 
  } else {
    const { requiredItems, registersWithError, newPayload } = response;

    await sendSqs({
      MessageBody: JSON.stringify({ payload: newPayload, exposedImportId, companyId }),
      QueueUrl: process.env.SQS_DISPATCH_QUEUE,
    });

    return res.status(200).json({ 
      message: "request was received with success, but some items weren't sent.",
      required: requiredItems,
      payloadWithError: registersWithError
    }); 
  }
};

const CONSTANT = {
	region: process.env.ENV_AWS_REGION,
  key:  process.env.ENV_AWS_ACCESS_KEY_ID,
  secret: process.env.ENV_AWS_SECRET_ACCESS_KEY
}

const SQS = new AWS.SQS({
  region: CONSTANT.region,
  secretAccessKey:CONSTANT.secret,
  accessKeyId: CONSTANT.key
});

const sendSqs = async (params): Promise<void> => {
  return new Promise((resolve, reject) => {
    SQS.sendMessage(params, function(err, data) {
        if (err) console.error('Request could not be sent to SQS')

        console.log(' -- Request sent to SQS -- ', params.QueueUrl);
        try {
          setTimeout(function(){
            resolve();
          },1000);
        } catch (e) {
          resolve();
        }
    });
  })
}
