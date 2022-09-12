import { Request, Response } from "express";
import ListTemplateDataService from "../services/TemplateDataService/ListTemplateDataService";
import CreateTemplateDataService from "../services/TemplateDataService/CreateTemplateDataService";
import UpdateTemplateDataService from "../services/TemplateDataService/UpdateTemplateDataService";
import DeleteTemplateDataService from "../services/TemplateDataService/DeleteTemplateDataService";
import ShowTemplateDataService from "../services/TemplateDataService/ShowTemplateDataService";
import { getIO } from "../libs/socket";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { templates, count, hasMore } = await ListTemplateDataService({
    searchParam,
    pageNumber
  });

  return res.json({ templates, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
    const { name, status, text, footer, createdAt, updatedAt } = req.body;

    const response = await CreateTemplateDataService({ name, status, text, footer, createdAt, updatedAt });

    const io = getIO();
    io.emit("templates", {
    action: "create",
    response
  });

    return res.status(200).json(response);
}

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { templatesId } = req.params;

  const response = await ShowTemplateDataService(templatesId);

  return res.status(200).json(response);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
    const { templatesId } = req.params;
    const templatesData = req.body;

    const response = await UpdateTemplateDataService({ templatesId, templatesData });

    const io = getIO();
    io.emit("templates", {
    action: "update",
    response
  });

    return res.status(200).json(response);
}

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { templateId } = req.params;

  await DeleteTemplateDataService(templateId);

  const io = getIO();
  io.emit("templates", {
    action: "delete",
    templateId
  });

  return res.status(200).json({ message: "Template deleted" });
};