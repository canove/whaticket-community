import axios from "axios";
import AppError from "../../errors/AppError";

interface Request {
  facebookAccessToken: string;
  whatsappAccountId: string;
}

const TestWhatsAppConnectionService = async ({
  facebookAccessToken,
  whatsappAccountId,
}: Request): Promise<boolean> => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v15.0/${whatsappAccountId}/phone_numbers?access_token=${facebookAccessToken}`
    );

    if (response.status === 200) {
      return true;
    }

    return false;
  } catch (err: any) {
    return false;
    // throw new AppError(err.message);
  }
};

export default TestWhatsAppConnectionService;
