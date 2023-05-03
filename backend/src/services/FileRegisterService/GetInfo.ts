import { Op } from "sequelize";
import ConnectionFiles from "../../database/models/ConnectionFile";
import FileRegister from "../../database/models/FileRegister";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";
import { preparePhoneNumber9Digit, removePhoneNumber9Digit, removePhoneNumber9DigitCountry, removePhoneNumberCountry, removePhoneNumberWith9Country } from "../../utils/common";

interface Request {
  msgWhatsId?: string;
  registerId?: string;
  phone?: string;
  companyId?: string;
}

interface Response {
  name: string;
  documentNumber: string;
  message: string;
  phoneNumber: string;
  companyId: string;
  var1: string;
  var2: string;
  var3: string;
  var4: string;
  var5: string;
  portfolio: string;
}

const GetInfo = async ({
  msgWhatsId = null,
  registerId = null,
  phone = null,
  companyId = null
}: Request): Promise<Response> => {
  let fileRegister = null;

  if (!fileRegister && msgWhatsId) {
    fileRegister = await FileRegister.findOne({
      where: { msgWhatsId }
    });
  }

  if (!fileRegister && registerId) {
    fileRegister = await FileRegister.findOne({
      where: { id: registerId }
    });
  }

  if (!fileRegister && phone && companyId) {
    fileRegister = await FileRegister.findOne({
      where: {
        phoneNumber: { 
          [Op.or]: [
            phone,
            removePhoneNumberWith9Country(phone),
            preparePhoneNumber9Digit(phone),
            removePhoneNumber9Digit(phone),
            removePhoneNumberCountry(phone),
            removePhoneNumber9DigitCountry(phone)
          ],
        },
        companyId: companyId,
        processedAt: { [Op.ne]: null }
      },
      order: [["createdAt", "DESC"]]
    });
  }

  if (!fileRegister) {
    throw new AppError("ERR_FILE_REGISTER_DO_NOT_EXISTS");
  }

  let portfolio = null;

  const whatsapp = await Whatsapp.findOne({
    where: { id: fileRegister.whatsappId }
  });

  let session = null;
  
  if (whatsapp) {
    session = whatsapp.name;

    if (whatsapp.connectionFileId) {
      const connectionFile = await ConnectionFiles.findOne({
        where: { id: whatsapp.connectionFileId }
      });
  
      portfolio = connectionFile.name;
    }
  }

  const response = {
    name: fileRegister.name,
    documentNumber: fileRegister.documentNumber,
    message: fileRegister.message,
    phoneNumber: fileRegister.phoneNumber,
    companyId: fileRegister.companyId,
    var1: fileRegister.var1,
    var2: fileRegister.var2,
    var3: fileRegister.var3,
    var4: fileRegister.var4,
    var5: fileRegister.var5,
    portfolio,
    session
  };

  return response;
};

export default GetInfo;
