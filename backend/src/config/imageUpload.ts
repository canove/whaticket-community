import multer from "multer";
import { v4 } from "uuid";
import path from "path";

const storagePermanent = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads"));
  },
  filename: (req, file, cb) => {
    const fileName = path.join(v4() + path.extname(file.originalname));
    cb(null, fileName);
  }
});

const storageTemporary = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../public/uploads/temp"));
  },
  filename: (req, file, cb) => {
    const fileName = path.join(v4() + path.extname(file.originalname));
    cb(null, fileName);
  }
});

const maxSize = 2 * 1024 * 1024; // 2MB
export const uploadPermanent = multer({
  storage: storagePermanent,
  limits: { fileSize: maxSize }
});
export const uploadTemporary = multer({
  storage: storageTemporary,
  limits: { fileSize: maxSize }
});
