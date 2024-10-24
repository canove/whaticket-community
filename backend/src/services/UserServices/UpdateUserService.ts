import * as Yup from "yup";

import AppError from "../../errors/AppError";
import { SerializeUser } from "../../helpers/SerializeUser";
import ShowUserService from "./ShowUserService";
import path from "path";
import fs from "fs";


interface UserData {
  email?: string;
  password?: string;
  name?: string;
  profile?: string;
  queueIds?: number[];
  whatsappId?: number;
}

interface Request {
  userData: UserData;
  userId: string | number;
}

interface Response {
  id: number;
  name: string;
  email: string;
  profile: string;
}

const UpdateUserService = async ({
  userData,
  userId
}: Request): Promise<Response | undefined> => {
  const user = await ShowUserService(userId);

  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    email: Yup.string().email(),
    profile: Yup.string(),
    password: Yup.string()
  });

  const { email, password, profile, name, queueIds = [], whatsappId, imagePath } = userData;
 
  try {
    await schema.validate({ email, password, profile, name });
  } catch (err) {
    throw new AppError(err.message);
  }


  let imageBanco = user.imagePath;
  if (imagePath){
    if (imageBanco){
      const oldImagePath = path.join("", imageBanco); //  endereço
      if (fs.existsSync(oldImagePath)) { // esta lá ?
        fs.unlinkSync(oldImagePath); // Rm antigo
      }
    }
  
  }

  await user.update({
    email,
    password,
    profile,
    name,
    imagePath,
    whatsappId: whatsappId ? whatsappId : null
  });

  await user.$set("queues", queueIds);

  await user.reload();

  return SerializeUser(user);
};

export default UpdateUserService;
