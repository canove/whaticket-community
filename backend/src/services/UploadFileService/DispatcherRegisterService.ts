import { Op } from "sequelize";

import axios from "axios";
import FileRegister from "../../database/models/FileRegister";
import Whatsapp from "../../database/models/Whatsapp";
import { FileStatus } from "../../enum/FileStatus";
import Templates from "../../database/models/TemplatesData";

/* eslint-disable */
const DispatcherRegisterService = async ({ file }): Promise<void> => {
  try {
    const containPending = await FileRegister.findAll({ 
      where: {
        fileId: file.id,
        companyId: file.companyId,
        processedAt: null
      }
    });

    if(containPending.length == 0){
      await file.update({ Status: FileStatus.Finished });
      return;
    }

    let whatsappIds;
    if (file.whatsappIds && file.whatsappIds != 'null')
      whatsappIds = file.whatsappIds.split(",");

    let accounts;

    if(whatsappIds) {
      accounts = await Whatsapp.findAll({
        where: {
          id: whatsappIds,
          companyId: file.companyId
        }
      });
    }else{
      accounts = await Whatsapp.findAll({
        where: {
          status: "CONNECTED",
          companyId: file.companyId,
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

    let template = null;
    if(file.templateId) {
      template = await Templates.findByPk(file.templateId);
    }
      
   
    for (const account of accounts) {
      if (account.official) {
        const registers = await FileRegister.findAll({
          where: {
            fileId: file.id,
            companyId: file.companyId,
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
              companyId: file.companyId,
              processedAt: null
            },
            limit: 1
          });

          if(!lastSend || now > lastSend && registers.length > 0){
            

            for (const reg of registers){
              let phoneNumber = reg.phoneNumber;
              if (phoneNumber.length > 12) {
                if (phoneNumber.length > 12){
                  let firstNumber = phoneNumber.substring(6,5);
                  if(firstNumber == "9" || firstNumber == "8") {
                    phoneNumber = `${phoneNumber.substring(4, 0)}${phoneNumber.substring(phoneNumber.length, 5)}`;
                  }
                }
          
              }

              let messageTxt = reg.message;

              if(template) {
                messageTxt = template.text
                .replace("{{name}}", reg.name)
                .replace("{{documentNumber}}", reg.documentNumber)
                .replace("{{phoneNumber}}", reg.phoneNumber);
              }
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
                  text: messageTxt,
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
        "x-api-key": process.env.WPP_OFFICIAL_API_KEY
      }});
    }

  } catch (e) {
    console.log(e);
    await file.update({ Status: FileStatus.Error });
  }
};

export default DispatcherRegisterService;
