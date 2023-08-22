import * as Yup from "yup";

import { Op } from "sequelize";
import showWhatsAppService  from "./ShowWhatsAppService";

import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import AssociateWhatsappQueue from "./AssociateWhatsappQueue";

interface WhatsappData {
    name ? : string;
    status ? : string;
    session ? : string;
    isDefault ? : boolean;
    greetingMessage ? : string;
    farewellMessage ? : string;
    queueIds ? : number[];
}

interface UpdateWhatsAppRequest {
    whatsappData: WhatsappData;
    whatsappId: string;
}

interface UpdateWhatsAppResponse {
    whatsapp: Whatsapp;
    oldDefaultWhatsapp: Whatsapp | null;
}

const updateWhatsAppService = async ({
    whatsappData,
    whatsappId
}: UpdateWhatsAppRequest): Promise < UpdateWhatsAppResponse > => {
    const schema = Yup.object().shape({
        name: Yup.string().min(2),
        status: Yup.string(),
        isDefault: Yup.boolean()
    });

    const {
        name,
        status,
        isDefault,
        session,
        greetingMessage,
        farewellMessage,
        queueIds = []
    } = whatsappData;

    try {
        await schema.validate({
            name,
            status,
            isDefault
        });
    } catch (err) {
        throw new AppError(err.message);
    }

    if (queueIds.length > 1 && !greetingMessage) {
        throw new AppError("ERR_WAPP_GREETING_REQUIRED");
    }

    let oldDefaultWhatsapp: Whatsapp | null = null;

    if (isDefault) {
        oldDefaultWhatsapp = await Whatsapp.findOne({
            where: {
                isDefault: true,
                id: {
                    [Op.not]: whatsappId
                }
            }
        });
        if (oldDefaultWhatsapp) {
            await oldDefaultWhatsapp.update({
                isDefault: false
            });
        }
    }

    const whatsapp = await showWhatsAppService(whatsappId);

    await whatsapp.update({
        name,
        status,
        session,
        greetingMessage,
        farewellMessage,
        isDefault
    });

    await AssociateWhatsappQueue(whatsapp, queueIds);

    return {
        whatsapp,
        oldDefaultWhatsapp
    };
};

export default updateWhatsAppService;