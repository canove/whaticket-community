import { Request, Response } from "express";
import AppError from "../errors/AppError";

const firebase = require("../utils/Firebase");

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.params;

  const database = await firebase.database();

  const companyConfigs = await database
    .collection("Services")
    .where("companyId", "==", parseInt(companyId))
    .get();

  return res
    .status(200)
    .json(companyConfigs.docs.map(doc => ({ id: doc.id, data: doc.data() })));
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { newService, docId } = req.body;
  const { companyId } = req.params;

  const database = await firebase.database();

  if (docId) {
    await database
      .collection("Services")
      .doc(docId)
      .set(
        {
          companyId: parseInt(companyId),
          connected: false,
          isFull: false,
          service: newService
        },
        { merge: true }
      );

    return res.status(200).json("Service Edited.");
  }

  const serviceInFirebase = await database
    .collection("Services")
    .where("companyId", "==", parseInt(companyId))
    .where("service", "==", newService)
    .get();

  if (serviceInFirebase.docs.length > 0) {
    throw new AppError("SERVICE_ALREADY_EXISTS");
  } else {
    await database
      .collection("Services")
      .doc()
      .set(
        {
          companyId: parseInt(companyId),
          connected: false,
          isFull: false,
          service: newService
        },
        { merge: true }
      );
    return res.status(200).json("Service Created.");
  }
};
