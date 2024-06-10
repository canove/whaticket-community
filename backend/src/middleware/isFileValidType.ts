import { NextFunction, Request, Response } from "express";
import { validateMIMEType } from "validate-image-type";

export const isFileValidType = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | void> => {
  const validationResult = await validateMIMEType(req.file!.path, {
    originalFilename: req.file!.originalname,
    allowMimeTypes: ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"]
  });
  if (!validationResult.ok) {
    return res.send(400);
  }
  return next();
};
