import { Op } from "sequelize";

import axios from "axios";
import randomWords from "random-words";
import Whatsapp from "../../database/models/Whatsapp";

/* eslint-disable */
const DispatcherPingService = async (): Promise<void> => {
  try {
    let accounts = await Whatsapp.findAll({
      where: {
        status: "CONNECTED",
        [Op.or]: [
          {
            official: false
          }
        ]
      },
      order: [['lastPingDate', 'ASC']],
    });
    const apiUrl = `${process.env.WPP_OFFICIAL_URL}?x-api-key=${process.env.WPP_OFFICIAL_API_KEY}`;
    let provider;

    if(accounts.length > 0){
      provider = accounts[0]
      await provider.update({ lastPingDate: new Date() });
    }

    if(provider) {
      accounts.forEach(async (account) => {
        if (!account.official && provider.name != account.name) { 
          const randomWordsNumber = Math.floor(Math.random() * 1) + 6;
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
              text: `${randomWords({ exactly: randomWordsNumber, join: ' ' })} -PING-`,
              parameters: []
            }
          }];

          await new Promise((resolve) => { setTimeout(() => resolve(true), Math.floor(Math.random() * 10000) + 3000) })
          await axios.post(apiUrl, JSON.stringify(payload), { headers: {
            "x-api-key": process.env.WPP_OFFICIAL_API_KEY
          }});
      }
      })
    }
  } catch (e) {
    console.log(e);
  }
};

export default DispatcherPingService;
