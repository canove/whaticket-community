import DialogFLow from "../../models/Dialogflow";

const ListDialogflowService = async (): Promise<DialogFLow[]> => {
  const dialogFLows = await DialogFLow.findAll();

  return dialogFLows;
};

export default ListDialogflowService;
