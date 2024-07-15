import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  email = "",
  extraInfo = []
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  const io = getIO();
  let contact: Contact | null;

  contact = await Contact.findOne({ where: { number } });

  if (contact) {
    if (profilePicUrl) {
      contact.update({ profilePicUrl });

      io.emit("contact", {
        action: "update",
        contact
      });
    }
  } else {
    try {
      contact = await Contact.create({
        name,
        number,
        ...(profilePicUrl && { profilePicUrl }),
        email,
        isGroup,
        extraInfo
      });

      io.emit("contact", {
        action: "create",
        contact
      });
    } catch (error) {
      console.log("---- Error al crear contacto", error);

      // Esperar 200 ms antes de reintentar
      await new Promise(resolve => setTimeout(resolve, 200));

      console.log(
        "---- Volvemos a verificar que el contacto no exista: ",
        number
      );

      // Verificar nuevamente que no exista ya
      contact = await Contact.findOne({ where: { number } });

      if (!contact) {
        console.log(
          "---- En la segunda verificación el contacto no existe, Reintentando otra vez crear el contacto: ",
          number
        );
        contact = await Contact.create({
          name,
          number,
          ...(profilePicUrl && { profilePicUrl }),
          email,
          isGroup,
          extraInfo
        });

        io.emit("contact", {
          action: "create",
          contact
        });
      } else {
        console.log(
          "---- En la segunda verificación, El contacto ya existe: ",
          number
        );
      }
    }
  }

  return contact;
};

export default CreateOrUpdateContactService;
