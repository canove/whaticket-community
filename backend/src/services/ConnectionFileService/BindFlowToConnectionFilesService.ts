import AppError from "../../errors/AppError";
import ConnectionFiles from "../../database/models/ConnectionFile";
import Whatsapp from "../../database/models/Whatsapp";

const BindFlowToConnectionFilesService = async ({
  connectionFileId,
  flowId,
  companyId
}): Promise<void> => {
  await Whatsapp.update({
    flowId
  }, {
    where: {
      official: false,
      deleted: false,
      connectionFileId,
      companyId,
    }
  });

  // const whatsapps = await Whatsapp.findAll({
  //   where: {
  //     official: false,
  //     deleted: false,
  //     connectionFileId: connectionFileId,
  //     companyId
  //   }
  // });

  // for (const whats of whatsapps) {
  //   await whats.update({
  //     flowId: flowId
  //   });
  // }
};

export default BindFlowToConnectionFilesService;
