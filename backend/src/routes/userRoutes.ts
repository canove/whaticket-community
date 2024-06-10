import { Router } from "express";

import multer from "multer";
import { v4 } from "uuid";
import path from "path";
import isAuth from "../middleware/isAuth";
import * as UserController from "../controllers/UserController";

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

const uploadPermanent = multer({ storage: storagePermanent });
const uploadTemporary = multer({ storage: storageTemporary });

const userRoutes = Router();

userRoutes.get("/users", isAuth, UserController.index);

userRoutes.post("/users", isAuth, UserController.store);

userRoutes.put("/users/:userId", isAuth, UserController.update);

userRoutes.get("/users/:userId", isAuth, UserController.show);

userRoutes.delete("/users/:userId", isAuth, UserController.remove);

userRoutes.post(
  "/users/:userId/upload-image",
  isAuth,
  uploadPermanent.single("file"),
  UserController.uploadImage
);

userRoutes.post(
  "/users/:userId/upload-temporary-image",
  isAuth,
  uploadTemporary.single("file"),
  (req, res) => {
    return res.status(200).json({ image: req.file?.filename });
  }
);
userRoutes.delete(
  "/users/:userId/delete-temporary-image",
  isAuth,
  UserController.deleteTemporaryImage
);

export default userRoutes;
