import { Op } from "sequelize";

import axios from "axios";
import FileRegister from "../../database/models/FileRegister";
import Whatsapp from "../../database/models/Whatsapp";
import { FileStatus } from "../../enum/FileStatus";
import Templates from "../../database/models/TemplatesData";
import { preparePhoneNumber } from "../../utils/common";
import WhatsappsConfig from "../../database/models/WhatsappsConfig";
import GreetingMessages from "../../database/models/GreetingMessages";
import GreetingMessageControls from "../../database/models/GreetingMessageControls";

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
      
    const noOffConfig = await WhatsappsConfig.findOne({
      where: { companyId: file.companyId }
    })

    let greetingMessages = [];
    let noOffConfigWhats;

    if (noOffConfig) {
      greetingMessages = await GreetingMessages.findAll({
        where: { configId: noOffConfig.id }
      })

      noOffConfigWhats = noOffConfig.whatsappIds ? noOffConfig.whatsappIds.split(",") : null;
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
        if (noOffConfig && noOffConfig.active === true && (noOffConfigWhats === null || noOffConfigWhats.indexOf(account.id) !== -1))  {
          const lastSend: Date = account.lastSendDate;
          const now = new Date();

          if (lastSend)
             lastSend.setMinutes(lastSend.getMinutes() + noOffConfig.triggerInterval);
          
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
            
            //tratar numero de telefone
            for (const reg of registers){
              let phoneNumber = preparePhoneNumber(reg.phoneNumber);
              let messageTxt = reg.message;
              let contactName ='';
              if (greetingMessages.length > 0) {
                const index = Math.floor(Math.random() * greetingMessages.length);
                messageTxt = greetingMessages[index].greetingMessage;

                payload.push({
                  company: '102780189204674', // QUANDO MUDAR PARA VARIAS EMPRESAS DEIXAR DINAMICO
                  person: reg.documentNumber,
                  activationMessage: {
                    session: account.name,
                    msgid: reg.id,
                    channel: "wpp_no",
                    type: '',
                    template: "",
                    to: {
                      identifier: phoneNumber,
                      name: reg.name
                    },
                    text: messageTxt,
                    parameters: []
                  }
                });

                GreetingMessageControls.create({
                  templateId: template ? template.id : null,
                  greetingMessageId: greetingMessages[index].id,
                  phoneNumber: phoneNumber
                })
              } else if(template) {
                const messagesTemplate = JSON.parse(template.text);
                
                for(const temp of messagesTemplate) {
                  switch(temp['type']) {
                    case 'contact':
                      messageTxt = preparePhoneNumber(temp['value']);
                      contactName = temp['name'];
                      break;
                    case 'text':
                      messageTxt = temp['value']
                      .replace("{{name}}", reg.name)
                      .replace("{{documentNumber}}", reg.documentNumber)
                      .replace("{{phoneNumber}}", reg.phoneNumber);
                      break;

                      default:
                         messageTxt = temp['value'];
                  }

                  payload.push({
                    company: '102780189204674', // QUANDO MUDAR PARA VARIAS EMPRESAS DEIXAR DINAMICO
                    person: reg.documentNumber,
                    activationMessage: {
                      session: account.name,
                      msgid: reg.id,
                      channel: "wpp_no",
                      type: temp['type'],
                      template: "",
                      to: {
                        identifier: phoneNumber,
                        name: reg.name
                      },
                      path: contactName != ''? contactName: messageTxt,
                      text: messageTxt,
                      parameters: []
                    }
                  });
                }

                GreetingMessageControls.create({
                  templateId: template.id,
                  phoneNumber: phoneNumber
                })
              } else { 
                payload.push({
                  company: '102780189204674', // QUANDO MUDAR PARA VARIAS EMPRESAS DEIXAR DINAMICO
                  person: reg.documentNumber,
                  activationMessage: {
                    session: account.name,
                    msgid: reg.id,
                    channel: "wpp_no",
                    type: '',
                    template: "",
                    to: {
                      identifier: phoneNumber,
                      name: reg.name
                    },
                    text: messageTxt,
                    parameters: []
                  }
                });

                GreetingMessageControls.create({
                  phoneNumber: phoneNumber
                })
              }
              processedRegister.push(reg);

              await reg.update({ processedAt: new Date(), whatsappId: account.id });
            }

            if(registers.length > 0) {
              await account.update({ lastSendDate: now.setMinutes(now.getMinutes() + 2) });
            }
          }
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
            
            //tratar numero de telefone
            for (const reg of registers){
              let phoneNumber = preparePhoneNumber(reg.phoneNumber);
              let messageTxt = reg.message;
              let contactName ='';
              if(template) {
                const messagesTemplate = JSON.parse(template.text);
                
                for(const temp of messagesTemplate) {
                  switch(temp['type']) {
                    case 'contact':
                      messageTxt = preparePhoneNumber(temp['value']);
                      contactName = temp['name'];
                      break;
                    case 'text':
                      messageTxt = temp['value']
                      .replace("{{name}}", reg.name)
                      .replace("{{documentNumber}}", reg.documentNumber)
                      .replace("{{phoneNumber}}", reg.phoneNumber);
                      break;

                      default:
                         messageTxt = temp['value'];
                  }

                  payload.push({
                    company: '102780189204674', // QUANDO MUDAR PARA VARIAS EMPRESAS DEIXAR DINAMICO
                    person: reg.documentNumber,
                    activationMessage: {
                      session: account.name,
                      msgid: reg.id,
                      channel: "wpp_no",
                      type: temp['type'],
                      template: "",
                      to: {
                        identifier: phoneNumber,
                        name: reg.name
                      },
                      path: contactName != ''? contactName: messageTxt,
                      text: messageTxt,
                      parameters: []
                    }
                  });
                }
              } else { 
                payload.push({
                  company: '102780189204674', // QUANDO MUDAR PARA VARIAS EMPRESAS DEIXAR DINAMICO
                  person: reg.documentNumber,
                  activationMessage: {
                    session: account.name,
                    msgid: reg.id,
                    channel: "wpp_no",
                    type: '',
                    template: "",
                    to: {
                      identifier: phoneNumber,
                      name: reg.name
                    },
                    text: messageTxt,
                    parameters: []
                  }
                });
              }
              processedRegister.push(reg);

              await reg.update({ processedAt: new Date(), whatsappId: account.id });
            }

            if(registers.length > 0) {
              await account.update({ lastSendDate: now.setMinutes(now.getMinutes() + 2) });
            }
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
