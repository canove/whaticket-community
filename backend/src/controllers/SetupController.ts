import { Request, Response } from "express";

import GetSetupStatus from "../services/SetupServices/GetSetupStatus";
import CreateInitialSetup from "../services/SetupServices/CreateInitialSetup";

export const status = async (req: Request, res: Response): Promise<Response> => {
  const result = await GetSetupStatus();
  return res.status(200).json(result);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { name, email, password } = req.body;

  const user = await CreateInitialSetup({ name, email, password });

  return res.status(201).json({ message: "Setup completed", user });
};
