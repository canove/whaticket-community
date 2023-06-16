import axios from "axios";
import AppError from "../../errors/AppError";
import Whatsapp from "../../database/models/Whatsapp";

const CheckNumberWhatsappService = async (number: string, whatsapp: Whatsapp): Promise<void> => {
  let isTimeOut = false;

  try {
    const source = axios.CancelToken.source();
    setTimeout(() => {
      isTimeOut = true;
      source.cancel();
    }, 10000);

    const apiUrl = "http://orquestrator.kankei.com.br:8080/checkNumber";

    await axios.post(apiUrl, 
      {
        "session": whatsapp.name,
        "number": number,
      },
      { 
        cancelToken: source.token,
        headers: {
          "api-key": process.env.WPPNOF_API_TOKEN,
          "sessionkey": process.env.WPPNOF_SESSION_KEY,
        }
      }
    );
  } catch (e: any) {
    if (e.response.data.message == "O telefone informado nao esta registrado no whatsapp.") {
      throw new AppError("ERR_NUMBER_DOES_NOT_HAVE_WHATSAPP");
    }
  }
};

export default CheckNumberWhatsappService;
