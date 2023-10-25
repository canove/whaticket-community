import Campaign from "../../models/Campaign";
import AppError from "../../errors/AppError";
import CampaignShipping from "../../models/CampaignShipping";
import ContactList from "../../models/ContactList";
import ContactListItem from "../../models/ContactListItem";
import Whatsapp from "../../models/Whatsapp";

const ShowService = async (id: string | number): Promise<Campaign> => {
  const record = await Campaign.findByPk(id, {
    include: [
      { model: CampaignShipping },
      { model: ContactList, include: [{ model: ContactListItem }] },
      { model: Whatsapp, attributes: ["id", "name"] }
    ]
  });

  if (!record) {
    throw new AppError("ERR_NO_TICKETNOTE_FOUND", 404);
  }

  return record;
};

export default ShowService;
