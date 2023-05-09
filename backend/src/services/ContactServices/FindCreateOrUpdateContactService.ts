import { Op } from "sequelize";

import Contact from "../../database/models/Contact";

import {
  removePhoneNumberWith9Country,
  preparePhoneNumber9Digit,
  removePhoneNumber9Digit,
  removePhoneNumberCountry,
  removePhoneNumber9DigitCountry
} from "../../utils/common";
import Ticket from "../../database/models/Ticket";
import Message from "../../database/models/Message";
import AppError from "../../errors/AppError";

interface Request {
  id?: number | string;
  number?: number;
  companyId?: number;
  ticket?: Ticket;
  message?: Message;
}

const FindCreateOrUpdateContactService = async ({
    id = null,
    companyId,
    ticket,
    message,
}: Request): Promise<Contact> => {
    let contact_1 = null; // ? Contact_1 -> COM CompanyID  
    let contact_2 = null; // ? Contact_2 -> SEM CompanyID

    contact_2 = await Contact.findOne({
        where: { id }
    });

    if (!contact_2) throw new AppError("NO_CONTACT_FOUND");

    contact_1 = await Contact.findOne({
        where: { 
            [Op.or]: [ { id }, { number: contact_2.number } ],
            companyId 
        },
        include: ["extraInfo"]
    });

    if (!contact_1 && contact_2) {
        const createdContact = await Contact.create({
            name: contact_2.name,
            number: contact_2.number,
            email: contact_2.email,
            profilePicUrl: contact_2.profilePicUrl,
            isGroup: contact_2.isGroup,
            companyId,
        });

        contact_1 = await Contact.findOne({
            where: { id: createdContact.id, companyId },
            include: ["extraInfo"]
        });
    }

    if (ticket && ticket.contactId && ticket.contactId != contact_1.id) {
        await ticket.update({ contactId: contact_1.id });
    }

    if (message && message.contactId && message.contactId != contact_1.id) {
        await message.update({ contactId: contact_1.id });
    }

    return contact_1;
};

export default FindCreateOrUpdateContactService;
