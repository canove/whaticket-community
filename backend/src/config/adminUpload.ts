import multer, { Multer, FileFilterCallback } from "multer";
import AppError from "../errors/AppError";
import { Request } from "express";

// Configuração
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, "uploads/");
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${uniqueSuffix}.${extension}`);
  }
});

// Filtro
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (req.user && req.user.profile !== "admin") {
    return cb(new AppError("ERR_NO_PERMISSION", 403), false);
  }
    // Verifica se o arquivo é uma imagem
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("ERR_INVALID_FILE_TYPE", 400), false); // Arquivo inválido
  }

  cb(null, true);
};

// Cria middleware de upload
const adminUpload: Multer = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limite de 2MB
});

export default adminUpload;
