import AppError from "../../errors/AppError";
import GetDefaultWhatsApp from "../../helpers/GetDefaultWhatsApp";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";

const ImportContactsService = async (): Promise<void> => {
  const defaultWhatsapp = await GetDefaultWhatsApp();

  const wbot = getWbot(defaultWhatsapp.id);

  let phoneContacts;

  try {
    phoneContacts = await wbot.getContacts();
  } catch (err) {
    console.log(
      "import - Could not get whatsapp contacts from phone. Check connection page.",
      err
    );
  }

  if (phoneContacts) {
    await Promise.all(
      phoneContacts.map(async ({ number, name }) => {
        if (name===null)  {
          console.log(
            `import - whatsapp contact with name equal null - number=[${number}] name=[${name}]`
          );
        } else if (number===null)  {
          console.log(
            `import - whatsapp contact with number equal null - number=[${number}] name=[${name}]`
          );
        } else {

          const numberExists = await Contact.findOne({
            where: { number }
          });
        
          if (numberExists) {
            console.log(
              `import - whatsapp contact with number ${number} already exists`
            );
          } else {
            if( (name==='') || (name===undefined) ) {
              name = 'idenfinido';
              console.log(
                `import - whatsapp contact name is blank. Resetting to UNDEFINED.`
              );              
            }
            console.log(`import - Contact number=[${number}] name=[${name}]`)
            await Contact.create({ number, name });
          }

        }
      })
    );
  }
};

export default ImportContactsService;
