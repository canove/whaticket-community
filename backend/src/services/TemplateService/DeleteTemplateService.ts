import axios from "axios";
import AppError from "../../errors/AppError";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";

const DeleteTemplateService = async ({
    whatsAppId,
    templateName
}) => {
    const whatsApp = await ShowWhatsAppService(whatsAppId);

    const facebookBusinessId = whatsApp.facebookBusinessId;
    const facebookToken = whatsApp.facebookToken;

    try {
        const response = await axios.delete(`https://graph.facebook.com/v13.0/${facebookBusinessId}/message_templates?name=${templateName}&access_token=${facebookToken}`);

        return response.data;
    } catch (err: any) {
        throw new AppError(err.message);
    }
}

export default DeleteTemplateService;
