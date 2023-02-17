import { Request, Response } from "express";
import ListTemplateService from "../services/TemplateService/ListTemplateService";
import ListMetaTemplateService from "../services/TemplateService/ListMetaTemplateService";
import CreateTemplateService from "../services/TemplateService/CreateTemplateService";
import UpdateTemplateService from "../services/TemplateService/UpdateTemplateService";
import DeleteTemplateService from "../services/TemplateService/DeleteTemplateService";
import GetWhatsappsTemplateService from "../services/TemplateService/GetWhatsappsTemplateService";
import CreateOfficialTemplateService from "../services/TemplateService/CreateOfficialTemplateService";
import { getIO } from "../libs/socket";
import BindTemplateService from "../services/TemplateService/BindTemplateService";
import OfficialTemplatesStatus from "../database/models/OfficialTemplatesStatus";
import AppError from "../errors/AppError";
import OfficialTemplates from "../database/models/OfficialTemplates";
import ShowTemplateService from "../services/TemplateService/ShowTemplateService";
import DeleteBitsTemplateService from "../services/TemplateService/DeleteBitsTemplateService";

interface TemplateData {
  name: string;
  footerText: string;
  category: string;
  bodyText: string;
  mapping: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const templates = await ListTemplateService({ companyId });

  return res.status(200).json(templates);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { templateId } = req.params;
  const { companyId } = req.user;

  const template = await ShowTemplateService({ companyId, templateId });

  return res.status(200).json(template);
};

type TemplateQuery = {
  templateId: string | number;
}

export const getWhatsapps = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { templateId } = req.query as TemplateQuery;

  const whatsapps = await GetWhatsappsTemplateService({ companyId, templateId });

  return res.status(200).json(whatsapps);
};

export const list = async (req: Request, res: Response): Promise<Response> => {
  const { whatsAppId } = req.params;
  const { companyId } = req.user;

  const response = await ListMetaTemplateService({ whatsAppId, companyId });

  return res.status(200).json(response);
};

export const bind = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;


  const response = await BindTemplateService({ data: req.body, companyId });

  return res.status(200).json(response);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    footerText,
    category,
    bodyText,
    mapping,
  }: TemplateData = req.body;

  const { companyId } = req.user;

  const template = await CreateTemplateService({
    name,
    footerText,
    category,
    bodyText,
    mapping,
    companyId
  });

  const io = getIO();
  io.emit(`officialTemplate${companyId}`, {
    action: "create",
    template
  });

  return res.status(200).json(template);
};

export const createOfficialTemplate = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  const { officialTemplate, mapping, headerVar, whatsappId, documentName } = req.body;

  const template = await CreateOfficialTemplateService({
    officialTemplate,
    mapping,
    headerVar,
    whatsappId,
    companyId,
    documentName
  });

  const io = getIO();
  io.emit(`officialTemplate${companyId}`, {
    action: "create",
    template
  });

  return res.status(200).json(template);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    templateName,
    category,
    whatsAppId,
    bodyText,
    footerText,
    templateId
  } = req.body;

  const { companyId } = req.user;

  const response = await UpdateTemplateService({
    templateName,
    category,
    whatsAppId,
    bodyText,
    footerText,
    templateId,
    companyId
  });

  return res.status(200).json(response);
};

export const updateStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { id, status, reason } = req.body;

  const template = await OfficialTemplatesStatus.findOne({
    where: { facebookTemplateId: id }
  });

  if (!template) throw new AppError("ERR_NO_TEMPLATE_FOUND");

  console.log('update template tempolatecontroller 152')
  await template.update({
    status: status,
    reason: reason ? reason : null,
  });

  return res.status(200).json("OK");
};

export const getParams = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { templateName } = req.query;
  const { companyId } = req.user;

  const template = await  OfficialTemplates.findOne({
    where: {
      companyId,
      name: templateName
    }
  });

  if (!template) throw new AppError("NO_TEMPLATE_FOUND", 404);

  let mapping = null;
  if (template.mapping) {
    let map = JSON.parse(template.mapping);

    mapping = {};

    Object.keys(map).map(key => {
      const item = map[key];

      mapping = {
        ...mapping,
        [item]: key
      }
    });
  }

  const response = {
    header: template.header ? JSON.parse(template.header) : null,
    body: template.body,
    footer: template.footer,
    mapping: mapping
  }

  return res.status(200).json(response);
};

type RemoveMetaQuery = {
  whatsAppId: string;
  templateName: string;
}

export const removeMeta = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsAppId, templateName } = req.query as RemoveMetaQuery;
  const { companyId } = req.user;

  const response = await DeleteTemplateService({
    whatsAppId,
    templateName,
    companyId
  });

  return res.status(200).json(response);
};

type RemoveBitsQuery = {
  whatsAppId: string;
  officialTemplateId: string;
}

export const removeBits = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { officialTemplateId } = req.query as RemoveBitsQuery;
  const { companyId } = req.user;

  const response = await DeleteBitsTemplateService({
    officialTemplateId,
    companyId
  });

  return res.status(200).json(response);
};
