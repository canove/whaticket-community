/* eslint-disable */
import { Op } from "sequelize";
import { Request, Response } from "express";

import Whatsapp from "../../database/models/Whatsapp";
import { preparePhoneNumber } from "../../utils/common";
import Templates from "../../database/models/TemplatesData";
import GreetingMessages from "../../database/models/GreetingMessages";
import GreetingMessageControls from "../../database/models/GreetingMessageControls";
import FileRegister from "../../database/models/FileRegister";
import WhatsappsConfig from "../../database/models/WhatsappsConfig";

import {
    removePhoneNumberWith9Country,
    preparePhoneNumber9Digit,
    removePhoneNumber9Digit,
    removePhoneNumberCountry,
    removePhoneNumber9DigitCountry
  } from "../../utils/common";

interface BodyData {
  contactNumber: string;
  session: string;
  receivedFromPhone: string;
}

const SendMessage = async (req: Request, res: Response): Promise<Response> => {
  const { contactNumber, session }: BodyData = req.body;

  try {
      const whatsapp = await Whatsapp.findOne({
          where: { name: session, deleted: 0 }
      });

      const whatsAppConfig = await WhatsappsConfig.findOne({
          where: { companyId: whatsapp.companyId, active: 1 }
      });

      let reg = await FileRegister.findOne({
          where: { 
              companyId: whatsapp.companyId,
              phoneNumber: 
            { 
                [Op.or]: [
                removePhoneNumberWith9Country(contactNumber),
                preparePhoneNumber9Digit(contactNumber),
                removePhoneNumber9Digit(contactNumber),
                removePhoneNumberCountry(contactNumber),
                removePhoneNumber9DigitCountry(contactNumber)
                ],
            },
              whatsappId: whatsapp.id
          },
          order: [['createdAt', 'DESC']]
      });

      if(reg) {
        console.log("update fileregister sendMessageservice 43");
          await reg.update({interactionAt: new Date()})
      }
      
      /*verifica mensagem de fishing*/
      let messageToSend = await GreetingMessageControls.findOne({
          where: { 
               phoneNumber : { 
                [Op.or]: [
                        removePhoneNumberWith9Country(contactNumber),
                        preparePhoneNumber9Digit(contactNumber),
                        removePhoneNumber9Digit(contactNumber),
                        removePhoneNumberCountry(contactNumber),
                        removePhoneNumber9DigitCountry(contactNumber)
                    ],
                },
               sendAt: null },
          order: [['createdAt', 'DESC']]
      });

      if(!messageToSend) { 
          throw("empty")
      }
      

      const greetingMessages = await GreetingMessages.findAll({
          where: { configId: whatsAppConfig.id }
      });

      if(!greetingMessages) {
          throw("empty")
      }

      const template = await Templates.findByPk(messageToSend.templateId);

      const payload = [];
      const apiUrl = `${process.env.WPP_OFFICIAL_URL}`;
      let messageTxt = '';
      let contactName = '';

    //   let phoneNumber = preparePhoneNumber(reg.phoneNumber);

      if (template) {
          const messagesTemplate = JSON.parse(template.text);

          let messageIndex = 0;
          
          for (const temp of messagesTemplate) {
            let buttons = null;

            switch(temp['type']) {
              case 'contact':
                messageTxt = preparePhoneNumber(temp['value']);
                contactName = temp['name'];
              break;
              case 'text':
                messageTxt = temp['value']
                .replace("{{name}}", reg.name)
                .replace("{{documentNumber}}", reg.documentNumber)
                .replace("{{var1}}", reg.var1)
                .replace("{{var2}}", reg.var2)
                .replace("{{var3}}", reg.var3)
                .replace("{{var4}}", reg.var4)
                .replace("{{var5}}", reg.var5)
                .replace("{{phoneNumber}}", reg.phoneNumber);
              break;
              case 'buttons':
                const text = temp['value']
                .replace("{{name}}", reg.name)
                .replace("{{documentNumber}}", reg.documentNumber)
                .replace("{{var1}}", reg.var1)
                .replace("{{var2}}", reg.var2)
                .replace("{{var3}}", reg.var3)
                .replace("{{var4}}", reg.var4)
                .replace("{{var5}}", reg.var5)
                .replace("{{phoneNumber}}", reg.phoneNumber);

                const footer = temp['footer']
                .replace("{{name}}", reg.name)
                .replace("{{documentNumber}}", reg.documentNumber)
                .replace("{{var1}}", reg.var1)
                .replace("{{var2}}", reg.var2)
                .replace("{{var3}}", reg.var3)
                .replace("{{var4}}", reg.var4)
                .replace("{{var5}}", reg.var5)
                .replace("{{phoneNumber}}", reg.phoneNumber);

                let image = null;

                if (temp['imageUrl']) {
                  const url = temp['imageUrl']
                  .replace("{{name}}", reg.name)
                  .replace("{{documentNumber}}", reg.documentNumber)
                  .replace("{{var1}}", reg.var1)
                  .replace("{{var2}}", reg.var2)
                  .replace("{{var3}}", reg.var3)
                  .replace("{{var4}}", reg.var4)
                  .replace("{{var5}}", reg.var5)
                  .replace("{{phoneNumber}}", reg.phoneNumber);

                  image = { url };
                }

                const templateButtons = temp['buttons'].map(button => {
                  if (button.type === "quickReplyButton") {
                    return {
                      "index": button.id,
                      "quickReplyButton": {
                        "displayText": button.text,
                        "id": button.buttonId
                      }
                    }
                  }

                  if (button.type === "callButton") {
                    return {
                      "index": button.id,
                      "callButton": {
                        "displayText": button.text,
                        "phoneNumber": button.phoneNumber
                      }
                    }
                  }

                  if (button.type === "urlButton") {
                    return {
                      "index": button.id,
                      "urlButton": {
                        "displayText": button.text,
                        "url": button.url
                      }
                    }
                  }
                });

                buttons = {
                  text,
                  footer,
                  image,
                  templateButtons
                }

              break;

              default:
                messageTxt = temp['value'];
            }

            payload.push({
              company: whatsapp.companyId,
              person: reg.documentNumber,
              messageIndex: messageIndex,
              activationMessage: {
                session: whatsapp.name,
                msgid: reg.id,
                channel: "wpp_no",
                type: temp['type'],
                template: "",
                to: {
                  identifier: contactNumber,
                  name: reg.name
                },
                path: contactName != '' ? contactName : messageTxt,
                text: temp['type'] !== "text" ? "" : messageTxt,
                parameters: [],
                buttons
              }
            });

            messageIndex++;
          }
        } else { 
          payload.push({
            company: whatsapp.companyId,
            person: reg.documentNumber,
            activationMessage: {
              session: whatsapp.name,
              msgid: reg.id,
              channel: "wpp_no",
              type: '',
              template: "",
              to: {
                identifier: contactNumber,
                name: reg.name
              },
              text: messageTxt,
              parameters: []
            }
          });
        }
  
      if (payload.length > 0) {
        console.log("update greetingmessageControl sendMessageservice 154");
          await messageToSend.update({sendAt: new Date()})
          /*await axios.post(apiUrl, payload, { headers: {
              "x-api-key": process.env.WPP_OFFICIAL_API_KEY
          }});*/
      }

      return res.status(200).json({
          session,
          payload,
        //   type: payload[0].activationMessage.type,
        //   body: payload[0].activationMessage.text,
          contactNumber
      });
  } catch (err) {
      return res.status(500).json({
          message: 'não há mensagem de callback | fishing',
          session,
          contactNumber
      });
  }
};

const CheckIfPingConnection = async (req: Request, res: Response): Promise<Response> => {
    const { receivedFromPhone }: BodyData = req.body;

    try {
        var whatsapp = await Whatsapp.findOne({
            where: {
              name: receivedFromPhone
            }
          })
        
          if (!whatsapp) {
            return res.status(401).json(false)
          }
        
          return res.status(200).json(true);
    } catch (err) {
        console.log('CHECK IF PING CONNECTION ERROR', err)
        return res.status(401).json(false);
    }
}

export default { SendMessage,CheckIfPingConnection };