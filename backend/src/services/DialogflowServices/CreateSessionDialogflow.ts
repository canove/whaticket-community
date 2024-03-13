import { SessionsClient } from "@google-cloud/dialogflow";
import Dialogflow from "../../models/Dialogflow";
import dir from 'path';
import fs from 'fs';
import os from 'os';
import { logger } from "../../utils/logger";

const sessions : Map<number, SessionsClient> = new Map<number, SessionsClient>();

const createDialogflowSession = async (id:number, projectName:string, jsonContent:string) : Promise<SessionsClient | undefined> => {
    if(sessions.has(id)) {
        return sessions.get(id);
    }

    const keyFilename = dir.join(os.tmpdir(), `whaticket_${id}.json`);

    logger.info(`Openig new dialogflow session #${projectName} in '${keyFilename}'`)

    await fs.writeFileSync(keyFilename, jsonContent);
    const session = new SessionsClient({ keyFilename });

    sessions.set(id, session);

    return session;
}

const createDialogflowSessionWithModel = async (model: Dialogflow) : Promise<SessionsClient | undefined> => {
    return createDialogflowSession(model.id, model.projectName, model.jsonContent);
}

export { createDialogflowSession, createDialogflowSessionWithModel };