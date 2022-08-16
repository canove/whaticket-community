import axios from "axios";
import FileRegister from "../../database/models/FileRegister";
import Whatsapp from "../../database/models/Whatsapp";
import { FileStatus } from "../../enum/FileStatus";

const DispatcherRegisterService = async ({ file }): Promise<void> => {
  try {
    const whatsappIds = file.whatsappIds.split(",");

    const accounts = await Whatsapp.findAll({
      where: {
        id: whatsappIds,
        status: "CONNECTED"
      }
    });

    const payload = [];
    const apiUrl = `${process.env.WPP_OFFICIAL_URL}?x-api-key=${process.env.WPP_OFFICIAL_API_KEY}`;
    let registers;

    await Promise.all(accounts.map(async (account) => {
      if (account.official) {
          registers = await FileRegister.findAll({
            where: {
              fileId: file.id,
              sentAt: null,
              processedAt: null
            },
            limit: 50
          });

          registers.forEach(async reg => {
            const params = reg.templateParams.split(",");
            const templateParams = [];
            params.forEach((param) => {
              templateParams.push({
                type: "text",
                text: param
              });
            });

            payload.push({
              company: account?.facebookBusinessId,
              person: reg.documentNumber,
              activationMessage: {
                msgid: reg.id,
                channel: "wpp",
                template: "saudacao",
                to: {
                  identifier: reg.phoneNumber,
                  name: reg.name
                },
                text: "",
                parameters: templateParams
              }
            });
          });
        } else {
          registers = await FileRegister.findAll({
            where: {
              fileId: file.id,
              sentAt: null,
              processedAt: null
            },
            limit: 1
          });

          registers.forEach(async reg => {
            let phoneNumber = reg.phoneNumber;
            if (phoneNumber.length > 12)
              phoneNumber = `${reg.phoneNumber.substring(4, 0)}${reg.phoneNumber.substring(reg.phoneNumber.length, 5)}`;

            registers.push(reg);
            payload.push({
              company: account?.facebookBusinessId,
              person: reg.documentNumber,
              activationMessage: {
                session: account.name,
                msgid: reg.id,
                channel: "wpp_no",
                template: "",
                to: {
                  identifier: phoneNumber,
                  name: reg.name
                },
                text: reg.message,
                parameters: []
              }
            });
          });

          const lastSend: Date = account.lastSendDate;
          const now = new Date();

        if (lastSend)
            lastSend.setMinutes(lastSend.getMinutes() + 2);

        if(!lastSend || now > lastSend){
          await account.update({ lastSendDate: now.setMinutes(now.getMinutes() + 2) });
        }
      }
    }))
   
    if (payload.length > 0) {
      await axios.post(apiUrl, JSON.stringify(payload), { headers: {
        "x-api-key": process.env.WPP_OFFICIAL_API_KEY
      }});
    
      await FileRegister.update({ processedAt: new Date() }, { where: {
        id: registers.map((x) => x.id)
      }})
    }

  } catch (e) {
    console.log(e);
    await file.update({ Status: FileStatus.Error });
  }
};

export default DispatcherRegisterService;
