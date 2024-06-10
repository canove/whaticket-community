import ChatbotOption from "../../models/ChatbotOption";

interface Request {
  queueId: number;
}

interface Response {
  chatbotOptions: ChatbotOption[];
}

const ListChatbotOptionService = async ({
  queueId
}: Request): Promise<Response> => {
  const chatbotOptions = await ChatbotOption.findAll({
    where: {
      queueId
    },
    include: ["fatherChatbotOption", "chatbotOptions"]
  });

  return {
    chatbotOptions
  };
};

export default ListChatbotOptionService;
