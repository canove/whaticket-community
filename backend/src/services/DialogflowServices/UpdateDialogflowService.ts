import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Dialogflow from "../../models/Dialogflow";
import ShowDialogflowService from "./ShowDialogflowService";

interface DialogflowData {
  name?: string;
  projectName?: string;
  jsonContent?: string;
  language?: string;
}

interface Request {
  dialogflowData: DialogflowData;
  dialogflowId: string;
}

const UpdateDialogflowService = async ({
  dialogflowData,
  dialogflowId
}: Request): Promise<Dialogflow> => {
  const schema = Yup.object().shape({
    name: Yup.string().min(2),
    projectName: Yup.string().min(2),
    jsonContent: Yup.string().min(2),
    language: Yup.string().min(2)
  });

  const {
    name,
    projectName,
    jsonContent,
    language
  } = dialogflowData;

  try {
    await schema.validate({ name, projectName, jsonContent, language });
  } catch (err) {
    throw new AppError(err.message);
  }
  
  const dialogflow = await ShowDialogflowService(dialogflowId);

  await dialogflow.update({
    name,
    projectName,
    jsonContent,
    language
  });

  return dialogflow;
};

export default UpdateDialogflowService;
