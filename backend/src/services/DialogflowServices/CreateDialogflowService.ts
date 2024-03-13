import * as Yup from "yup";

import AppError from "../../errors/AppError";
import Dialogflow from "../../models/Dialogflow";


interface Request {
  name: string;
  projectName: string;
  jsonContent: string;
  language: string;
}

const CreateDialogflowService = async ({
  name,
  projectName,
  jsonContent,
  language
}: Request): Promise<Dialogflow> => {
  const schema = Yup.object().shape({
    name: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This DialogFlow name is already used.",
        async value => {
          if (!value) return false;
          const nameExists = await Dialogflow.findOne({
            where: { name: value }
          });
          return !nameExists;
        }
      ),
      projectName: Yup.string()
      .required()
      .min(2)
      .test(
        "Check-name",
        "This DialogFlow projectName is already used.",
        async value => {
          if (!value) return false;
          const nameExists = await Dialogflow.findOne({
            where: { projectName: value }
          });
          return !nameExists;
        }
      ),
      jsonContent: Yup.string()
      .required()
      ,
      language: Yup.string()
      .required()
      .min(2)
    });

  try {
    await schema.validate({ name, projectName, jsonContent, language });
  } catch (err) {
    throw new AppError(err.message);
  }


  const dialogflow = await Dialogflow.create(
    {
      name,
      projectName,
      jsonContent,
      language
    }
  );

   return dialogflow;
};

export default CreateDialogflowService;
