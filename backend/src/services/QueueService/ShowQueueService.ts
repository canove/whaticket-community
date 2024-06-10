import AppError from "../../errors/AppError";
import ChatbotOption from "../../models/ChatbotOption";
import Queue from "../../models/Queue";

const ShowQueueService = async (queueId: number | string): Promise<Queue> => {
  const queue = await Queue.findByPk(queueId, {
    include: [
      {
        model: ChatbotOption,
        as: "chatbotOptions",
        where: {
          fatherChatbotOptionId: null
        },
        required: false
      }
    ]
  });

  if (!queue) {
    throw new AppError("ERR_QUEUE_NOT_FOUND");
  }

  return queue;
};

export default ShowQueueService;
