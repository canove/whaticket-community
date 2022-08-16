import axios from "axios";
import AppError from "../../errors/AppError";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

const UpdateTemplateService = async ({
    templateName,
    category,
    whatsAppId,
    bodyText,
    footerText,
    templateId
}) => {
    const whatsApp = await ShowWhatsAppService(whatsAppId);

    const facebookToken = whatsApp.facebookToken;

    try {
        const response = await axios.post(`https://graph.facebook.com/v13.0/${templateId}?name=${templateName}&language=pt_BR&category=${category}&access_token=${facebookToken}`, {
            components: [
                {
                    type:"BODY",
                    text:bodyText
                },
                {
                    type:"FOOTER",
                    text:footerText
                }
            ]
        });

        return response;
    } catch (err: any) {
        throw new AppError(err);
    }
};

export default UpdateTemplateService;