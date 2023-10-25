import fs from "fs";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import { sendAttachmentFromUrl } from "./graphAPI";
// import { verifyMessage } from "./facebookMessageListener";

interface Request {
  ticket: Ticket;
  media?: Express.Multer.File;
  body?: string;
  url?: string;
}

export const typeAttachment = (media: Express.Multer.File) => {
  if (media.mimetype.includes("image")) {
    return "image";
  }
  if (media.mimetype.includes("video")) {
    return "video";
  }
  if (media.mimetype.includes("audio")) {
    return "audio";
  }

  return "file";
};

export const sendFacebookMessageMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<any> => {
  try {
    const type = typeAttachment(media);

    const domain = `${process.env.BACKEND_URL}/public/${media.filename}`

    const sendMessage = await sendAttachmentFromUrl(
      ticket.contact.number,
      domain,
      type,
      ticket.whatsapp.facebookUserToken
    );

    await ticket.update({ lastMessage: media.filename });

    fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export const sendFacebookMessageMediaExternal = async ({
  url,
  ticket,
  body
}: Request): Promise<any> => {
  try {
    const type = "image"

    // const domain = `${process.env.BACKEND_URL}/public/${media.filename}`

    const sendMessage = await sendAttachmentFromUrl(
      ticket.contact.number,
      url,
      type,
      ticket.whatsapp.facebookUserToken
    );

    const randomName = Math.random().toString(36).substring(7);

    await ticket.update({ lastMessage: body ||  `${randomName}.jpg}`});

    // fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};

export const sendFacebookMessageFileExternal = async ({
  url,
  ticket,
  body
}: Request): Promise<any> => {
  try {
    const type = "file"

    // const domain = `${process.env.BACKEND_URL}/public/${media.filename}`

    const sendMessage = await sendAttachmentFromUrl(
      ticket.contact.number,
      url,
      type,
      ticket.whatsapp.facebookUserToken
    );

    const randomName = Math.random().toString(36).substring(7);

    await ticket.update({ lastMessage: body ||  `${randomName}.pdf}`});

    // fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    throw new AppError("ERR_SENDING_FACEBOOK_MSG");
  }
};