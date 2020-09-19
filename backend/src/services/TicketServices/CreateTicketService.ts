import * as Yup from "yup";

import AppError from "../../errors/AppError";
import User from "../../models/User";

interface Request {
  email: string;
  password: string;
  name: string;
  profile?: string;
}

interface Response {
  email: string;
  name: string;
  id: number;
  profile: string;
}

const CreateTicketService = async (): Promise<boolean> => {
  return true;
};

export default CreateTicketService;
