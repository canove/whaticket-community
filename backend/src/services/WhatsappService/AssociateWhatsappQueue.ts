import Whatsapp from "../../models/Whatsapp.js";

const AssociateWhatsappQueue = async (
  whatsapp: Whatsapp,
  queueIds: number[]
): Promise<void> => {
  await whatsapp.$set("queues", queueIds);

  await whatsapp.reload();
};

export default AssociateWhatsappQueue;
