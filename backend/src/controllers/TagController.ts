import { Request, Response } from "express";
import { getIO } from "../libs/socket";

import CreateTagService from "../services/TagServices/CreateTagService";
import ListTagsService from "../services/TagServices/ListTagsService";
import UpdateTagService from "../services/TagServices/UpdateTagService";
import DeleteTagService from "../services/TagServices/DeleteTagService";
import AppError from "../errors/AppError";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { tags, count, hasMore } = await ListTagsService({
    searchParam,
    pageNumber,
    tenantId: req.tenantId!
  });

  return res.json({ tags, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, color, description } = req.body;

  const tag = await CreateTagService({
    name,
    color,
    description,
    tenantId: req.tenantId!
  });

  const io = getIO();
  io.to(`tenant:${req.tenantId}`).emit("tag", {
    action: "create",
    tag
  });

  return res.status(201).json(tag);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tagId } = req.params;
  const { name, color, description } = req.body;

  const tag = await UpdateTagService({
    tagId,
    name,
    color,
    description,
    tenantId: req.tenantId!
  });

  const io = getIO();
  io.to(`tenant:${req.tenantId}`).emit("tag", {
    action: "update",
    tag
  });

  return res.status(200).json(tag);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tagId } = req.params;

  await DeleteTagService({
    tagId,
    tenantId: req.tenantId!
  });

  const io = getIO();
  io.to(`tenant:${req.tenantId}`).emit("tag", {
    action: "delete",
    tagId
  });

  return res.status(200).json({ message: "Tag deleted" });
};