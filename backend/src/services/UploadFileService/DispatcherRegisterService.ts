import { Op } from "sequelize";

import axios from "axios";
import FileRegister from "../../database/models/FileRegister";
import Whatsapp from "../../database/models/Whatsapp";
import { FileStatus } from "../../enum/FileStatus";

/* eslint-disable */
const DispatcherRegisterService = async ({ file }): Promise<void> => {
  try {
    const containPending = await FileRegister.findAll({ 
      where: {
        fileId: file.id,
        processedAt: null
      }
    });

    if(containPending.length == 0){
      await file.update({ Status: FileStatus.Finished });
      return;
    }

    let whatsappIds;
    if (file.whatsappIds)
      whatsappIds = file.whatsappIds.split(",");

    let accounts;

    if(whatsappIds) {
      accounts = await Whatsapp.findAll({
        where: {
          id: whatsappIds
        }
      });
    }else{
      accounts = await Whatsapp.findAll({
        where: {
          status: "CONNECTED",
          [Op.or]: [
            {
              official: file.official
            }
          ]
        }
      });
    }

    const payload = [];
    const apiUrl = `${process.env.WPP_OFFICIAL_URL}?x-api-key=${process.env.WPP_OFFICIAL_API_KEY}`;
    let processedRegister = [];
   
    for (const account of accounts) {
      if (account.official) {
        const registers = await FileRegister.findAll({
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
            processedRegister.push(reg);
            payload.push({
              company: '102780189204674', // QUANDO MUDAR PARA VARIAS EMPRESAS DEIXAR DINAMICO
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
            await reg.update({ processedAt: new Date(), whatsappId: account.id });
        });
      } else {
          const lastSend: Date = account.lastSendDate;
          const now = new Date();

          if (lastSend)
             lastSend.setMinutes(lastSend.getMinutes() + 2);
          
          const registers = await FileRegister.findAll({
            where: {
              fileId: file.id,
              sentAt: null,
              processedAt: null
            },
            limit: 1
          });

          if(!lastSend || now > lastSend && registers.length > 0){
            

            for (const reg of registers){
              let phoneNumber = reg.phoneNumber;
              if (phoneNumber.length > 12)
                phoneNumber = `${reg.phoneNumber.substring(4, 0)}${reg.phoneNumber.substring(reg.phoneNumber.length, 5)}`;

                processedRegister.push(reg);
                payload.push({
                  company: '102780189204674', // QUANDO MUDAR PARA VARIAS EMPRESAS DEIXAR DINAMICO
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

                await reg.update({ processedAt: new Date(), whatsappId: account.id });
            }

              if(registers.length > 0) {
                await account.update({ lastSendDate: now.setMinutes(now.getMinutes() + 2) });
              }
            }
        }
    }
    
    if (payload.length > 0) {
      await axios.post(apiUrl, JSON.stringify(payload), { headers: {
        "x-api-key": process.env.WPP_OFFICIAL_API_KEY,
        "api-key": process.env.WPPNOF_API_TOKEN
      }});
    }

  } catch (e) {
    console.log(e);
    await file.update({ Status: FileStatus.Error });
  }
};

export default DispatcherRegisterService;
