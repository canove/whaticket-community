import Dialogflow from "../../models/Dialogflow";
import AppError from "../../errors/AppError";


const ShowDialogflowService = async (id: string | number): Promise<Dialogflow> => {
  const dialogflow = await Dialogflow.findByPk(id);

  if (!dialogflow) {
    throw new AppError("ERR_NO_DIALOG_FOUND", 404);
  }

  return dialogflow;
};

export default ShowDialogflowService;
