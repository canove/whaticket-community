import ConnectionFiles from "../../database/models/ConnectionFile";
import FileRegister from "../../database/models/FileRegister";
import Whatsapp from "../../database/models/Whatsapp";
import AppError from "../../errors/AppError";

interface Request {
  msgWhatsId: string;
  registerId: string;
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
  registerId = null
}: Request): Promise<Response> => {
  let fileRegister = null;

  if (msgWhatsId) {
    fileRegister = await FileRegister.findOne({
      where: { msgWhatsId }
    });
  }

  if (registerId) {
    fileRegister = await FileRegister.findOne({
      where: { id: registerId }
    });
  }

  if (!fileRegister) {
    throw new AppError("ERR_FILE_REGISTER_DO_NOT_EXISTS");
  }

  let portfolio = null;

  const whatsapp = await Whatsapp.findOne({
    where: { id: fileRegister.whatsappId }
  });

  if (whatsapp && whatsapp.connectionFileId) {
    const connectionFile = await ConnectionFiles.findOne({
      where: { id: whatsapp.connectionFileId }
    });

    portfolio = connectionFile.name;
  }

  const response = {
    name: fileRegister.name,
    documentNumber: fileRegister.documentNumber,
    message: fileRegister.message,
    phoneNumber: fileRegister.phoneNumber,
    session: whatsapp.name,
    companyId: fileRegister.companyId,
    var1: fileRegister.var1,
    var2: fileRegister.var2,
    var3: fileRegister.var3,
    var4: fileRegister.var4,
    var5: fileRegister.var5,
    portfolio
  };

  return response;
};

export default GetInfo;
