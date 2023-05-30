import AppError from "../../errors/AppError";
import Contact from "../../database/models/Contact";
import axios from "axios";
import Whatsapp from "../../database/models/Whatsapp";
import BlockedContacts from "../../database/models/BlockedContacts";

interface Request {
  contactId: string;
  session: string;
  companyId: number;
}

const BlockOrUnblockContactService = async ({
  contactId,
  session,
  companyId,
}: Request): Promise<Contact> => {
  const contact = await Contact.findOne({
    where: { id: contactId, companyId },
    attributes: ["id", "name", "number", "email", "companyId", "profilePicUrl"],
    include: [
      "extraInfo",
      {
        model: BlockedContacts,
        as: "blockedContacts",
        attributes: ["id", "session"],
        required: false,
      }
    ]
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  const isBlocked = await BlockedContacts.findOne({
    where: { contactId, session, companyId }
  });

  try {
    const BLOCK_UNBLOCK_NUMBER_URL = "http://omni.kankei.com.br:8080/block-unblock";

    const payload = {
      "session": session,
      "number": contact.number,
      "action": (isBlocked) ? "unblock" : "block"
    }

    const response = await axios.post(BLOCK_UNBLOCK_NUMBER_URL, payload, {
        headers: {
            "api-key": process.env.WPPNOF_API_TOKEN,
            "sessionkey": process.env.WPPNOF_SESSION_KEY,
        }
    });

    if (isBlocked) {
      await isBlocked.destroy();
    } else {
      await BlockedContacts.create({
        contactId,
        session,
        companyId,
      });
    }
  } catch (err) {
    console.log("Block / Unblock Number Error", err);
    if (isBlocked) {
      throw new AppError("ERR_UNBLOCK_NUMBER");
    } else {
      throw new AppError("ERR_BLOCK_NUMBER");
    }
  }

  await contact.reload({
    attributes: ["id", "name", "number", "email", "profilePicUrl"],
    include: [
      "extraInfo",
      {
        model: BlockedContacts,
        as: "blockedContacts",
        attributes: ["id", "session"],
        required: false,
      }
    ]
  });

  return contact;
};

export default BlockOrUnblockContactService;
