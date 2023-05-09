import AppError from "../../errors/AppError";
import Contact from "../../database/models/Contact";
import CreateContactService from "./CreateContactService";

interface ExtraInfo {
    name: string;
    value: string;
    companyId: number;
}

interface Request {
    name: string;
    number: string;
    companyId: number;
    email?: string;
    profilePicUrl?: string;
    extraInfo?: ExtraInfo[];
}

const GetContactService = async ({ name, number, companyId }: Request): Promise<Contact> => {
    const numberExists = await Contact.findOne({
        where: { number, companyId }
    });

    if (!numberExists) {
        const contact = await CreateContactService({
            name,
            number,
            companyId
        })

        if (contact == null) {
            throw new AppError("CONTACT_NOT_FIND");
        } else {
            return contact;
        }
    }

    return numberExists;
};

export default GetContactService;