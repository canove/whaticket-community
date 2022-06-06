import * as Yup from "yup";

import AppError from "../../errors/AppError";

import { SessionsClient } from "@google-cloud/dialogflow";
import dir from 'path';
import fs from 'fs';
import os from 'os';
import { logger } from "../../utils/logger";
import { queryDialogFlow } from "./QueryDialogflow";


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
}: Request) : Promise<Response | null> => {
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
  //console.log( projectName, jsonContent, language )
  try {
    await schema.validate({ projectName, jsonContent, language });
  } catch (err) {
    throw new AppError(err.message);
  }
  
  const keyFilename = dir.join(os.tmpdir(), `TestSession_${projectName}.json`);

  logger.info(`Test dialogflow session #${projectName} in '${keyFilename}'`)

  fs.writeFileSync(keyFilename, jsonContent);

  const session = new SessionsClient({ keyFilename });
  
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

  if (!dialogFlowReply) {
    throw new AppError("ERR_TEST_REPLY_DIALOG", 400);
  }

  const messages = [];
  for(let message of dialogFlowReply) {
    messages.push(message.text.text[0]);
  }

  
  fs.unlinkSync(keyFilename);
  return { messages };
}

export default TestDialogflowSession;
