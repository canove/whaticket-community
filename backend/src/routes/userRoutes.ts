import { Router } from "express";

import isAuth from "../middleware/isAuth";
import * as UserController from "../controllers/UserController";
import { isFileValidType } from "../middleware/isFileValidType";
import { uploadPermanent, uploadTemporary } from "../config/imageUpload";

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
  isFileValidType,
  UserController.uploadImage
);

userRoutes.post(
  "/users/:userId/upload-temporary-image",
  isAuth,
  uploadTemporary.single("file"),
  isFileValidType,
  (req, res) => {
    return res.status(200).json({ image: req.file?.filename });
  }
);
userRoutes.delete(
  "/users/:userId/delete-temporary-image",
  isAuth,
  UserController.deleteTemporaryImage
);

userRoutes.delete(
  "/users/:userId/delete-image",
  isAuth,
  UserController.deleteImage
);

export default userRoutes;
