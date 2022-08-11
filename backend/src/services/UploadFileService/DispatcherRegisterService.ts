import axios from "axios";
import FileRegister from "../../database/models/FileRegister";
import Whatsapp from "../../database/models/Whatsapp";
import { FileStatus } from "../../enum/FileStatus";

const DispatcherRegisterService = async ({ file }): Promise<void> => {
  try {
    const registers = await FileRegister.findAll({
      where: {
        fileId: file.id,
        sentAt: null,
        processedAt: null
      },
      limit: 50
    });

    const account = await Whatsapp.findOne({
      where: {
        id: file.whatsappId
      }
    });
    const payload = [];
    const apiUrl = `${process.env.WPP_OFFICIAL_URL}?x-api-key=${process.env.WPP_OFFICIAL_API_KEY}`;

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

    if(payload.length > 0) {
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
