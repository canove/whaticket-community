import QueueOption from "../../models/QueueOption";

interface QueueOptionData {
  queueId: string;
  title: string;
  option: string;
  message?: string;
  parentId?: string;
}

const CreateService = async (queueOptionData: QueueOptionData): Promise<QueueOption> => {
  const queueOption = await QueueOption.create(queueOptionData);
  return queueOption;
};

export default CreateService;
