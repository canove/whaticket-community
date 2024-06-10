import AppError from "../../errors/AppError";
import ChatbotOption from "../../models/ChatbotOption";

interface ChatbotOptionData {
  name: string;
  message: string;
}

interface Request {
  chatbotOptionData: ChatbotOptionData;
  chatbotOptionId: string;
}

const UpdateChatbotOptionService = async ({
  chatbotOptionData,
  chatbotOptionId
}: Request): Promise<ChatbotOption> => {
  const { name, message } = chatbotOptionData;

  const chatbotOption = await ChatbotOption.findOne({
    where: { id: chatbotOptionId }
  });

  if (!chatbotOption) {
    throw new AppError("ERR_NO_CHATBOT_OPTION_FOUND", 404);
  }
  await chatbotOption.update({
    name,
    message
  });

  await chatbotOption.reload();

  return chatbotOption;
};

export default UpdateChatbotOptionService;
