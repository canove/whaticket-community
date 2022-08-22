import Dialogflow from "../../models/Dialogflow";
import AppError from "../../errors/AppError";

const DeleteDialogflowService = async (id: string): Promise<void> => {
  const dialogflow = await Dialogflow.findOne({
    where: { id }
  });

  if (!dialogflow) {
    throw new AppError("ERR_NO_DIALOG_FOUND", 404);
  }

  await dialogflow.destroy();
};

export default DeleteDialogflowService;
