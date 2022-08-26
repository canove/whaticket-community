import { Op } from "sequelize";

import axios from "axios";
import randomWords from "random-words";
import Whatsapp from "../../database/models/Whatsapp";

/* eslint-disable */
const DispatcherPingService = async ({ file }): Promise<void> => {
  try {
    let whatsappIds;
    if (file.whatsappIds && file.whatsappIds != 'null')
      whatsappIds = file.whatsappIds.split(",");

    let accounts;

    if(whatsappIds) {
      accounts = await Whatsapp.findAll({
        where: {
          id: whatsappIds, 
        },
        order: [['lastPingDate', 'DESC']],
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
        },
        order: [['lastPingDate', 'DESC']],
      });
    }

    const apiUrl = `${process.env.WPP_OFFICIAL_URL}?x-api-key=${process.env.WPP_OFFICIAL_API_KEY}`;
    let provider;

    if(accounts.length > 0)
      provider = accounts[accounts.length -1]
      await provider.update({ lastPingDate: new Date() });
    for (const account of accounts) {
      if (!account.official && provider.name != account.name) { 
            const payload = [{
              company: '102780189204674', // QUANDO MUDAR PARA VARIAS EMPRESAS DEIXAR DINAMICO
              person: account.name,
              activationMessage: {
                session: provider.name,
                msgid: 0,
                channel: "wpp_no",
                template: "",
                to: {
                  identifier: account.name,
                  name: account.name
                },
                text: `${randomWords({ exactly: 5, join: ' ' })} -PING-`,
                parameters: []
              }
            }];

            await new Promise((resolve) => { setTimeout(() => resolve(true), 3000) })
            await axios.post(apiUrl, JSON.stringify(payload), { headers: {
              "x-api-key": process.env.WPP_OFFICIAL_API_KEY
            }});
        }
    }
  } catch (e) {
    console.log(e);
  }
};

export default DispatcherPingService;
