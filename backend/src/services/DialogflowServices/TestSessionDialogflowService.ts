import * as Yup from "yup";

import AppError from "../../errors/AppError";

import { queryDialogFlow } from "./QueryDialogflow";
import { createDialogflowSession } from "./CreateSessionDialogflow";


interface Request {
  projectName: string;
  jsonContent: string;
  language: string;
}

interface Response {
  messages: string[];
}


const TestDialogflowSession = async ({
  projectName,
  jsonContent,
  language
}: Request): Promise<Response | null> => {
  const schema = Yup.object().shape({
    projectName: Yup.string()
      .required()
      .min(2),
    jsonContent: Yup.string()
      .required(),
    language: Yup.string()
      .required()
      .min(2)
  });

  try {
    await schema.validate({ projectName, jsonContent, language });
  } catch (err) {
    throw new AppError(err.message);
  }

  const session = await createDialogflowSession(999, projectName, jsonContent);

  if (!session) {
    throw new AppError("ERR_TEST_SESSION_DIALOG", 400);
  }

  let dialogFlowReply = await queryDialogFlow(
    session,
    projectName,
    "TestSeesion",
    "Ola",
    language,
  );

  await session.close();

  if (!dialogFlowReply) {
    throw new AppError("ERR_TEST_REPLY_DIALOG", 400);
  }

  const messages = [];
  for (let message of dialogFlowReply) {
    messages.push(message.text.text[0]);
  }

  return { messages };
}

export default TestDialogflowSession;
