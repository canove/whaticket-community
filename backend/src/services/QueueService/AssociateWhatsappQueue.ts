import Whatsapp from "../../models/Whatsapp";
import WhatsappQueue from "../../models/WhatsappQueue";

interface QueueData {
  id: number;
  optionNumber: number;
}

const AssociateWhatsappQueue = async (
  whatsapp: Whatsapp,
  queuesData: QueueData[]
): Promise<void> => {
  const queueIds = queuesData.map(({ id }) => id);

  await whatsapp.$set("queues", queueIds);

  /* eslint-disable no-restricted-syntax */
  /* eslint-disable no-await-in-loop */
  for (const queueData of queuesData) {
    await WhatsappQueue.update(
      { optionNumber: queueData.optionNumber },
      {
        where: {
          whatsappId: whatsapp.id,
          queueId: queueData.id
        }
      }
    );
  }
};

export default AssociateWhatsappQueue;
