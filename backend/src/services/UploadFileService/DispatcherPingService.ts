import { Op } from "sequelize";

import axios from "axios";
import randomWords from "random-words";
import Whatsapp from "../../database/models/Whatsapp";

/* eslint-disable */
function shuffleArray(arr) {
    // Loop em todos os elementos
  for (let i = arr.length - 1; i > 0; i--) {
        // Escolhendo elemento aleatório
    const j = Math.floor(Math.random() * (i + 1));
    // Reposicionando elemento
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  // Retornando array com aleatoriedade
  return arr;
}
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
    let idsToSended = [];
    for(let n = 0; n < accounts.length; n ++) {
      idsToSended.push(n);
    }
    idsToSended = shuffleArray(idsToSended);

    for(let n = 0; n < accounts.length; n ++) {
      try {
        let provider = accounts[n];
        let idsToSendedIndex = 0;
        let receipt = accounts[idsToSended[idsToSendedIndex]];
        if(receipt.name == provider.name){
          idsToSendedIndex = 1;
          receipt = accounts[idsToSended[idsToSendedIndex]];
        }
          
        idsToSended.splice(idsToSendedIndex,1);

        if (!provider.official) { 
          await provider.update({ lastPingDate: new Date() });

          const randomWordsNumber = Math.floor(Math.random() * 1) + 3;
          const payload = [{
            company: '102780189204674', // QUANDO MUDAR PARA VARIAS EMPRESAS DEIXAR DINAMICO
            person: receipt.name,
            activationMessage: {
              session: provider.name,
              msgid: 0,
              channel: "wpp_no",
              template: "",
              to: {
                identifier: receipt.name,
                name: receipt.name
              },
              text: `${randomWords({ exactly: randomWordsNumber, join: ' ' })} -PING-`,
              parameters: []
            }
          }];
          await axios.post(apiUrl, JSON.stringify(payload), { headers: {
            "x-api-key": process.env.WPP_OFFICIAL_API_KEY
          }});
      }

      }catch {}

    }
  } catch (e) {
    console.log(e);
  }
};

export default DispatcherPingService;
