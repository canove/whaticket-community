import * as Sentry from "@sentry/node";
import { SessionsClient } from "@google-cloud/dialogflow";
import { logger } from "../../utils/logger";

async function detectIntent(
    sessionClient:SessionsClient,
    projectId:string,
    sessionId:string,
    query:string,
    languageCode:string
) {
    const sessionPath = sessionClient.projectAgentSessionPath(
        projectId,
        sessionId
    );

    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: query,
                languageCode: languageCode,
            },
        },
    };

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
}

async function queryDialogFlow(
    sessionClient:SessionsClient,
    projectId:string, 
    sessionId:string, 
    query:string, 
    languageCode:string
) : Promise<any | null> {
    let intentResponse;

    try {
        intentResponse = await detectIntent(
            sessionClient,
            projectId,
            sessionId,
            query,
            languageCode
        );

        const responses = intentResponse?.queryResult?.fulfillmentMessages;

        if (responses?.length === 0) {
            return null;
        } else {
            return responses;
        }
    } catch (error) {
        Sentry.captureException(error);
        logger.error(`Error handling whatsapp message: Err: ${error}`);
    }

    return null;
}

export {queryDialogFlow}