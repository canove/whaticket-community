import axios from "axios";
import AppError from "../../errors/AppError";

interface Request {
  facebookToken: string;
  facebookPhoneNumberId: string;
  facebookBusinessId: string;
}

const TestWhatsAppConnectionService = async ({
  facebookToken,
  facebookPhoneNumberId,
  facebookBusinessId
}: Request): Promise<string> => {
  try {
    const response = await axios.get(
      `https://graph.facebook.com/v13.0/${facebookBusinessId}/phone_numbers?access_token=${facebookToken}`
    );

    const phoneNumbers = response.data.data;

    let phoneNumberExists = false;
    phoneNumbers.every((phoneNumber: { id: number | string }) => {
      if (phoneNumber.id === facebookPhoneNumberId) {
        phoneNumberExists = true;
        return false;
      }
      return true;
    });

    if (phoneNumberExists) {
      return "Success!";
    }

    throw new AppError("Error!");
  } catch (err: any) {
    throw new AppError(err.message);
  }
};

export default TestWhatsAppConnectionService;
