import Baileys from "../../models/Baileys";

const DeleteBaileysService = async (id: string | number): Promise<void> => {
  const baileysData = await Baileys.findOne({
    where: {
      whatsappId: id
    }
  });

  if (baileysData) {
    await baileysData.destroy();
  }
};

export default DeleteBaileysService;
