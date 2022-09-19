import axios, { AxiosResponse } from "axios";
import AppError from "../../errors/AppError";

const TestWhatsAppConnectionService = async ({
    facebookToken, 
    facebookPhoneNumberId, 
    facebookBusinessId
}) => {
    try {
        const response = await axios.get(`https://graph.facebook.com/v13.0/${facebookBusinessId}/phone_numbers?access_token=${facebookToken}`);

        const phoneNumbers = response.data.data;

        let phoneNumberExists = false;
        phoneNumbers.every((phoneNumber: { id: any; }) => {
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
}

export default TestWhatsAppConnectionService;