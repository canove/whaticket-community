import * as Yup from "yup";
import AppError from "../../errors/AppError";
import ChatbotOption from "../../models/ChatbotOption";

interface ChatbotOptionData {
  name: string;
  message: string;
  queueId: number;
  fatherChatbotOptionId?: number;
}

const CreateChatbotOptionService = async (
  chatbotOptionData: ChatbotOptionData
): Promise<ChatbotOption> => {
  const { name, message, queueId, fatherChatbotOptionId } = chatbotOptionData;

  const chatbotOptionSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_Category_INVALID_NAME")
      .required("ERR_Category_INVALID_NAME"),
    message: Yup.string()
      .min(2, "ERR_Category_INVALID_NAME")
      .required("ERR_MESSAGE_INVALID_MESSAGE"),
    queueId: Yup.number().required("ERR_QUEUE_INVALID_ID")
  });

  try {
    await chatbotOptionSchema.validate({ name, message, queueId });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  console.log({ fatherChatbotOptionId });

  if (!fatherChatbotOptionId) {
    const newChatbotOption = await ChatbotOption.create({
      name,
      message,
      queueId
    });

    return newChatbotOption;
  } else {
    console.log({ fatherChatbotOptionId });

    // verify if fatherChatbotOption has hasSubOptions = true
    const fatherChatbotOption = await ChatbotOption.findByPk(
      fatherChatbotOptionId
    );

    if (!fatherChatbotOption) {
      throw new AppError("ERR_NO_FATHER_OPTION_FOUND", 404);
    }

    if (!fatherChatbotOption.hasSubOptions) {
      await ChatbotOption.update(
        { hasSubOptions: true },
        { where: { id: fatherChatbotOptionId } }
      );
    }

    const newChatbotOption = await ChatbotOption.create({
      name,
      message,
      queueId,
      fatherChatbotOptionId
    });

    return newChatbotOption;
  }
};

export default CreateChatbotOptionService;
