import axios from "axios";
import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";
import AppError from "../../errors/AppError";

interface Request {
  connectionId: string | number;
  whatsappAccountId: string;
  companyId: string | number;
}

const TestWhatsAppConnectionService = async ({
  connectionId,
  whatsappAccountId,
  companyId
}: Request): Promise<boolean> => {
  const officialWhatsapp = await OfficialWhatsapp.findOne({
    where: { id: connectionId, companyId }
  });

  if (!officialWhatsapp) throw new AppError("ERR_NO_CONNECTION_FOUND");

  const { facebookAccessToken } = officialWhatsapp;

  try {
    const { data, status } = await axios.get(
      `https://graph.facebook.com/v15.0/${whatsappAccountId}/phone_numbers?access_token=${facebookAccessToken}`
    );

    if (status === 200) return data;

    throw new AppError("ERR_GET_WHATSAPP_NUMBER");
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export default TestWhatsAppConnectionService;
