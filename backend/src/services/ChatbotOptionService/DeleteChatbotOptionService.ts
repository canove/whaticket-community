import AppError from "../../errors/AppError";
import ChatbotOption from "../../models/ChatbotOption";

const DeleteChatbotOptionService = async (id: string): Promise<void> => {
  const chatbotOption = await ChatbotOption.findOne({
    where: { id }
  });

  if (!chatbotOption) {
    throw new AppError("ERR_NO_QUICK_ANSWER_FOUND", 404);
  }

  // search if his fatherChatbotOption has more children
  // if not, set hasSubOptions to false
  const fatherChatbotOption = await ChatbotOption.findOne({
    where: { id: chatbotOption.fatherChatbotOptionId },
    include: [
      {
        model: ChatbotOption,
        as: "chatbotOptions"
      }
    ]
  });

  if (fatherChatbotOption && fatherChatbotOption.chatbotOptions.length === 1) {
    await ChatbotOption.update(
      { hasSubOptions: false },
      { where: { id: fatherChatbotOption.id } }
    );
  }

  await chatbotOption.destroy();
};

export default DeleteChatbotOptionService;
