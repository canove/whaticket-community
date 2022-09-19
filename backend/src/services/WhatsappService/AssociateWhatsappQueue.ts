import Whatsapp from "../../database/models/Whatsapp";

const AssociateWhatsappQueue = async (
  whatsapp: Whatsapp,
  queueIds: number[]
): Promise<void> => {
  await whatsapp.$set("queues", queueIds);

  await whatsapp.reload();
};

export default AssociateWhatsappQueue;
