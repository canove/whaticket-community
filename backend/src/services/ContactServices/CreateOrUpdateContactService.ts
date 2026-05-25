import { getIO } from "../../libs/socket.js";
import Contact from "../../models/Contact.js";
import Ticket from "../../models/Ticket.js";
import { logger } from "../../utils/logger.js";
import { withRedisLock } from "../../helpers/withRedisLock.js";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  lid?: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
}

const emitContact = (action: "update" | "create", contact: Contact) => {
  const io = getIO();

  io.to("notification").emit("contact", { action, contact });
};

const doCreateOrUpdate = async ({
  name,
  number,
  lid,
  profilePicUrl,
  isGroup,
  email,
  extraInfo
}: Request & { number: string }): Promise<Contact> => {
  const [contactByNumber, contactByLid] = await Promise.all([
    number ? Contact.findOne({ where: { number } }) : null,
    lid ? Contact.findOne({ where: { lid } }) : null
  ]);

  const shouldMerge =
    contactByNumber && contactByLid && contactByNumber.id !== contactByLid.id;

  if (shouldMerge) {
    await Ticket.update(
      { contactId: contactByNumber.id },
      { where: { contactId: contactByLid.id } }
    );

    await contactByLid.destroy();

    await contactByNumber.update({
      lid: contactByLid.lid,
      profilePicUrl
    });

    logger.info({
      info: "Merged contacts by number and lid",
      primaryContactId: contactByNumber.id,
      mergedContactId: contactByLid.id
    });

    emitContact("update", contactByNumber);

    return contactByNumber;
  }

  if (contactByNumber) {
    await contactByNumber.update({
      lid: lid || contactByNumber.lid,
      profilePicUrl
    });

    emitContact("update", contactByNumber);

    return contactByNumber;
  }

  if (contactByLid) {
    await contactByLid.update({
      number: number || contactByLid.number,
      profilePicUrl
    });

    emitContact("update", contactByLid);
    return contactByLid;
  }

  const created = await Contact.create({
    name,
    number,
    lid,
    profilePicUrl,
    email,
    isGroup,
    extraInfo
  } as any);

  emitContact("create", created);
  return created;
};

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  lid,
  profilePicUrl,
  isGroup,
  email = "",
  extraInfo = []
}: Request): Promise<Contact> => {
  // Instagram numbers are prefixed with "ig_" — skip phone number sanitization for them
  const number =
    isGroup || rawNumber.startsWith("ig_")
      ? rawNumber
      : rawNumber.replace(/[^0-9]/g, "");
  if (!number && !lid) throw new Error("Either number or lid must be provided");

  // Lock by number (or lid as fallback) to prevent duplicate contact creation
  // when two messages from the same new contact arrive simultaneously.
  const lockKey = `contact:lock:${number || lid}`;
  return withRedisLock(lockKey, () =>
    doCreateOrUpdate({
      name,
      number,
      lid,
      profilePicUrl,
      isGroup,
      email,
      extraInfo
    })
  );
};

export default CreateOrUpdateContactService;
