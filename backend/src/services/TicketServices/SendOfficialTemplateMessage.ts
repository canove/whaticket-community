import axios from "axios";
import OfficialTemplates from "../../database/models/OfficialTemplates";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";

interface Request {
  to: string;
  whatsapp?: Whatsapp;
  templateId?: string;
  templateVariables?: string;
  templateHeader?: string;
}

const SendOfficialTemplateMessage = async ({
  whatsapp,
  to,
  templateId,
  templateVariables,
  templateHeader,
}: Request): Promise<any> => {
  const variables = JSON.parse(templateVariables);
  const header = JSON.parse(templateHeader);

  const { facebookPhoneNumberId } = whatsapp;

  const metaWhats = await OfficialWhatsapp.findOne({
    where: { id: whatsapp.officialWhatsappId, companyId: whatsapp.companyId }
  });

  const template = await OfficialTemplates.findOne({
    where: { id: templateId }
  });

  const metaToken = metaWhats.facebookAccessToken;

  const authHeaders = {
    'Authorization': `Bearer ${metaToken}`
  };

  let components = null;

  if (variables && Object.keys(variables).length > 0) {
    components = [];

    let parameters = Object.keys(variables).map(key => ({
      type: "text",
      text: variables[key]
    }));

    components.push({
      type: "BODY",
      parameters
    });
  }

  const requestBody = {
    messaging_product: "whatsapp",
    recipient_type : "individual",
    to,
    type: "template",
    template: { 
      name: template.name, 
      language: { code: 'pt_BR' },
      components
    },
  }

  try {
    const REQUEST_URL = `https://graph.facebook.com/v16.0/${facebookPhoneNumberId}/messages`

    const response = await axios.post(REQUEST_URL, requestBody, { headers: authHeaders });

    return response;
  } catch (err: any) {
    throw new AppError(err?.response?.data?.error?.message);
  }
};

export default SendOfficialTemplateMessage;
