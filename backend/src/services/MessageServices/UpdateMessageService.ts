import Message from "../../models/Message";

interface MessageData {
  isDeleted?: boolean;
}

interface Request {
  messageData: MessageData;
  messageId: string;
}

const UpdateMessageService = async ({
  messageData,
  messageId
}: Request): Promise<Response> => {
  const { isDeleted } = messageData;
  const message = Message.update({ where: {messageId}, { isDeleted: true } } );
};

export default UpdateMessageService;
