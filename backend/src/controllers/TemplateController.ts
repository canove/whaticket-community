import { Request, Response } from "express";
import ListTemplateService from "../services/TemplateService/ListTemplateService";
import CreateTemplateService from "../services/TemplateService/CreateTemplateService";
import UpdateTemplateService from "../services/TemplateService/UpdateTemplateService";
import DeleteTemplateService from "../services/TemplateService/DeleteTemplateService";

interface TemplateData {
  templateName: string;
  category: string;
  whatsAppsId: string[] | number[];
  bodyText: string;
  footerText: string;
  templateId: string | number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { whatsAppId } = req.params;
  const { companyId } = req.user;

  const response = await ListTemplateService({ whatsAppId, companyId });

  return res.status(200).json(response);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    templateName,
    category,
    whatsAppsId,
    bodyText,
    footerText
  }: TemplateData = req.body;

  const { companyId } = req.user;

  const response = await CreateTemplateService({
    templateName,
    category,
    whatsAppsId,
    bodyText,
    footerText,
    companyId
  });

  return res.status(200).json(response);
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

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsAppId, templateName } = req.params;
  const { companyId } = req.user;

  const response = await DeleteTemplateService({
    whatsAppId,
    templateName,
    companyId
  });

  return res.status(200).json(response);
};
