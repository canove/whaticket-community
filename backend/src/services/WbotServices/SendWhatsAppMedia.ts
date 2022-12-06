import fs from "fs";
import AppError from "../../errors/AppError";
import Ticket from "../../database/models/Ticket";
/*eslint-disable*/
import formatBody from "../../helpers/Mustache";
import Whatsapp from "../../database/models/Whatsapp";
import Message from "../../database/models/Message";
import Contact from "../../database/models/Contact";
import FileRegister from "../../database/models/FileRegister";
import axios from "axios";
import CreateMessageService from "../MessageServices/CreateMessageService";
import AWS from "aws-sdk";
import OfficialWhatsapp from "../../database/models/OfficialWhatsapp";
import ShowCompanyService from "../CompanyService/ShowCompanyService";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  companyId: number;
  body?: string;
}

const SendWhatsAppMedia = async ({
  media,
  ticket,
  companyId,
  body
}: Request): Promise<void> => {
  try {

    const connnection = await Whatsapp.findOne({
      where: {
        id: ticket.whatsappId
       }});
  
    const message = await Message.findAll({
      where: {
        ticketId: ticket.id,
        fromMe: false
      },
      order: [
        ['createdAt', 'DESC'],
      ],
      limit: 1
    });
  

    const contact = await Contact.findOne({ where: {
      id: message[0].contactId
    }});
  
    const messageSended = await FileRegister.findOne({
      where: {
        phoneNumber: contact.number,
        companyId: companyId
      }
    });
    
    if(!messageSended && !contact)
      throw new AppError("ERR_SENDING_WAPP_MSG");
  
    if (connnection?.official) {
      const offConnection = await OfficialWhatsapp.findOne({
        where: { id: connnection.officialWhatsappId }
      });

      let link = "";
      let type = media.mimetype.split('/')[0];

      try {
        let path = require('path');

        const blob = fs.readFileSync(media.path);
        const file = path.basename(media.path);

        link = await upoloadToS3(blob, file, type, companyId);
      } catch (err) {
        throw new AppError("ERR_UPLOADING_MEDIA");
      };

      try {
        const apiUrl = `https://graph.facebook.com/v13.0/${connnection.facebookPhoneNumberId}/messages`;

        let typePayload = null;

        if (type != "image" && type != "audio" && type != "video" && type != "sticker") type = "document";

        if (type === "document") {
          typePayload = { link, caption: media.originalname }
        } else {
          typePayload = { link };
        }

        const payload = {
          "messaging_product": "whatsapp",
          "preview_url": false,
          "recipient_type": "individual",
          "to": !messageSended?.phoneNumber ? contact.number : messageSended?.phoneNumber,
          type,
          [type]: typePayload
        };

        // const payload = {
        //   "messaging_product": "whatsapp",
        //   "preview_url": false,
        //   "recipient_type": "individual",
        //   "to": !messageSended?.phoneNumber ? contact.number : messageSended?.phoneNumber,
        //   "type": "text",
        //   "text": {
        //     "body": formatBody(body, ticket.contact)
        //   }
        // };
  
        var result = await axios.post(apiUrl, payload, {
          headers: {
            "Authorization": `Bearer ${offConnection.facebookAccessToken}`
          }
        });

        if(result.status == 200){
            const msgWhatsId = result.data.messages[0].id;
            
            const messageData = {
              id: msgWhatsId,
              ticketId: ticket.id,
              contactId: undefined,
              body: body,
              fromMe: true,
              read: true,
              mediaUrl: link,
              mediaType: type,
              quotedMsgId: null,
              bot: ticket.status == 'inbot',
              companyId
            };
          
            await ticket.update({ lastMessage: body });
            await CreateMessageService({ messageData });
        
        }else{
          throw new AppError("ERR_SENDING_WAPP_MSG");
        }
      } catch (e) {
        throw new AppError("ERR_SENDING_WAPP_MSG");
      }
    } else {
      try {
        let path = require('path');
        const apiUrl = `${process.env.WPPNOF_URL}/${ path.extname(media.path) == '.mp3'? 'sendAudio64':'sendFile64'}`;
        let phoneNumber = !messageSended?.phoneNumber?contact.number: messageSended?.phoneNumber;
        
        if (phoneNumber.length > 12){
          let firstNumber = phoneNumber.substring(6,5);
          if(firstNumber == "9" || firstNumber == "8") {
            phoneNumber = `${phoneNumber.substring(4, 0)}${phoneNumber.substring(phoneNumber.length, 5)}`;
          }
        }
        
        let base64file = await fs.readFileSync(media.path, {encoding: 'base64'});
        let buffer = await fs.readFileSync(media.path);
        let mediaUrl = await upoloadToS3(buffer,path.basename(media.path),media.mimetype.split('/')[0],connnection.companyId);

        const payload = {
          "session": connnection.name,
          "number": phoneNumber,
          "text": "",//(body == '' || body == null?'':formatBody(body, ticket.contact)),
          "path": `data:${media.mimetype};base64,${base64file}`
        };
  
        var result = await axios.post(apiUrl, payload, {
          headers: {
            "api-key": `${process.env.WPPNOF_API_TOKEN}`,
            "sessionkey": `${process.env.WPPNOF_SESSION_KEY}`
          }
        });

        fs.unlink(media.path, (err: Error) => {
          if (err) {
              console.log(err)
          }
        });
  
        if(result.status == 200){
            const msgWhatsId = result.data.data.id;
            
            const messageData = {
              id: msgWhatsId,
              ticketId: ticket.id,
              bot: ticket.status == 'inbot',
              contactId: undefined,
              body: body,
              fromMe: true,
              read: true,
              mediaUrl: mediaUrl,
              mediaType: media.mimetype.split('/')[0],
              quotedMsgId: null,
              companyId
            };
          
            await ticket.update({ lastMessage: body });
            await CreateMessageService({ messageData });
        
        }else{
          throw new AppError("ERR_SENDING_WAPP_MSG");
        }
      } catch (e) {
        throw new AppError("ERR_SENDING_WAPP_MSG");
      }
    }
  } catch (err) {
    console.log(err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

const upoloadToS3 = async (blob, file, type, companyId ): Promise<string> => {
  try {
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    })
    const dt = new Date();
    const fileName = `${dt.getTime()}_${file}`;
    let ext = file.split('.').pop();

    const params = {
        Bucket: process.env.AWS_S3_BUCKET,
        Key: `${companyId}/${dt.getFullYear()}/${(dt.getMonth()+1).toString().padStart(2,'0')}/${dt.getDate().toString().padStart(2,'0')}/${fileName}`,
        Body: blob,
        ContentEncoding: 'base64',
        ContentType: `${type}/${ext}`
    }

    var result = await new Promise<string>((resolve) => {
      s3.upload(params, (err, data) => {
        resolve(data.Location)
      })
    });

    return result;    
  }catch(err){
      console.log('ocorreu um erro ao tentar enviar o arquivo para o s3',err)
      console.log('ocorreu um erro ao tentar enviar o arquivo para o s3',JSON.stringify(err))
  }   
};

export default SendWhatsAppMedia;
