import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";

interface ExtraInfo {
    name: string;
    value: string;
}

interface Request {
    name: string;
    number: string;
    email?: string;
    profilePicUrl?: string;
    extraInfo?: ExtraInfo[];
}

const GetContactService = async ({ name, number }: Request): Promise<Contact> => {
    const numberExists = await Contact.findOne({
        where: { number }
    });

    if (!numberExists) {
        throw new AppError("CONTACT_NOT_FIND");
    }

    return numberExists;
};

export default GetContactService;