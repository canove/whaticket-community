import { SessionsClient } from "@google-cloud/dialogflow";
import Dialogflow from "../../models/Dialogflow";
import dir from 'path';
import fs from 'fs';
import os from 'os';
import { logger } from "../../utils/logger";

const sessions : Map<number, SessionsClient> = new Map<number, SessionsClient>();

const createDialogflowSession = async (model: Dialogflow) : Promise<SessionsClient | undefined> => {
    if(sessions.has(model.id)) {
        return sessions.get(model.id);
    }

    const keyFilename = dir.join(os.tmpdir(), `whaticket_${model.id}.json`);

    logger.info(`Openig new dialogflow session #${model.projectName} in '${keyFilename}'`)

    await fs.writeFileSync(keyFilename, model.jsonContent);
    const session = new SessionsClient({ keyFilename });

    sessions.set(model.id, session);

    return session;
}

export { createDialogflowSession };