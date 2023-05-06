import AppError from "../../errors/AppError";
import ConnectionFiles from "../../database/models/ConnectionFile";
import Whatsapp from "../../database/models/Whatsapp";

const BindQueueToConnectionFilesService = async ({
  connectionFileId,
  queueId,
  companyId
}): Promise<void> => {
  const whatsapps = await Whatsapp.findAll({
    where: {
      official: false,
      deleted: false,
      connectionFileId,
      companyId
    }
  });

  const queueIds = queueId ? [queueId] : [];

  for (const whats of whatsapps) {
    await whats.$set("queues", queueIds);
  }
};

export default BindQueueToConnectionFilesService;
