import { Request, Response } from "express";
import { cacheLayer } from "../libs/cache";
import { getIO } from "../libs/socket";
import { getWbot, removeWbot } from "../libs/wbot";
import Whatsapp from "../models/Whatsapp";
import DeleteBaileysService from "../services/BaileysServices/DeleteBaileysService";
import { getAccessTokenFromPage, getPageProfile, subscribeApp } from "../services/FacebookServices/graphAPI";
import { StartWhatsAppSession } from "../services/WbotServices/StartWhatsAppSession";

import CreateWhatsAppService from "../services/WhatsappService/CreateWhatsAppService";
import DeleteWhatsAppService from "../services/WhatsappService/DeleteWhatsAppService";
import ListWhatsAppsService from "../services/WhatsappService/ListWhatsAppsService";
import ShowWhatsAppService from "../services/WhatsappService/ShowWhatsAppService";
import UpdateWhatsAppService from "../services/WhatsappService/UpdateWhatsAppService";

interface WhatsappData {
  name: string;
  queueIds: number[];
  companyId: number;
  greetingMessage?: string;
  complationMessage?: string;
  outOfHoursMessage?: string;
  ratingMessage?: string;
  status?: string;
  isDefault?: boolean;
  token?: string;
}

interface QueryParams {
  session?: number | string;
}

interface InstagramBusinessAccount {
  id: string;
  username: string;
  name: string;
}

interface Root {
  name: string;
  // eslint-disable-next-line camelcase
  access_token: string;
  // eslint-disable-next-line camelcase
  instagram_business_account: InstagramBusinessAccount;
  id: string;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { session } = req.query as QueryParams;
  const whatsapps = await ListWhatsAppsService({ companyId, session });

  return res.status(200).json(whatsapps);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const {
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    queueIds,
    token
  }: WhatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await CreateWhatsAppService({
    name,
    status,
    isDefault,
    greetingMessage,
    complationMessage,
    outOfHoursMessage,
    queueIds,
    companyId,
    token
  });

  StartWhatsAppSession(whatsapp, companyId);

  const io = getIO();
  io.emit(`company-${companyId}-whatsapp`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const storeFacebook = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const {
    facebookUserId,
    facebookUserToken,
    addInstagram
  }: {
    facebookUserId: string;
    facebookUserToken: string;
    addInstagram: boolean;
  } = req.body;
  const { companyId } = req.user;

  const { data } = await getPageProfile(facebookUserId, facebookUserToken);

  if (data.length === 0) {
    return res.status(400).json({
      error: "Facebook page not found"
    });
  }
  const io = getIO();

  const pages = [];
  for await (const page of data) {
    const { name, access_token, id, instagram_business_account } = page;


    const acessTokenPage = await getAccessTokenFromPage(access_token);

    if (instagram_business_account && addInstagram) {
      const {
        id: instagramId,
        username,
        name: instagramName
      } = instagram_business_account;
      pages.push({
        name: `Insta ${username || instagramName}`,
        facebookUserId: facebookUserId,
        facebookPageUserId: instagramId,
        facebookUserToken: acessTokenPage,
        tokenMeta: facebookUserToken,
        isDefault: false,
        channel: "instagram",
        status: "CONNECTED",
        greetingMessage: "",
        farewellMessage: "",
        queueIds: [],
        isMultidevice: false,
        companyId
      });

      // await subscribeApp(instagramId, acessTokenPage);


      pages.push({
        name,
        facebookUserId: facebookUserId,
        facebookPageUserId: id,
        facebookUserToken: acessTokenPage,
        tokenMeta: facebookUserToken,
        isDefault: false,
        channel: "facebook",
        status: "CONNECTED",
        greetingMessage: "",
        farewellMessage: "",
        queueIds: [],
        isMultidevice: false,
        companyId
      });

      await subscribeApp(id, acessTokenPage);

    }

    if (!instagram_business_account) {
      pages.push({
        name,
        facebookUserId: facebookUserId,
        facebookPageUserId: id,
        facebookUserToken: acessTokenPage,
        tokenMeta: facebookUserToken,
        isDefault: false,
        channel: "facebook",
        status: "CONNECTED",
        greetingMessage: "",
        farewellMessage: "",
        queueIds: [],
        isMultidevice: false,
        companyId
      });

      await subscribeApp(page.id, acessTokenPage);
    }
  }

  console.log(pages)

  for await (const pageConection of pages) {
    const exist = await Whatsapp.findOne({
      where: {
        facebookPageUserId: pageConection.facebookPageUserId
      }
    });

    if (exist) {
      await exist.update({
        ...pageConection
      });
    }

    if (!exist) {
      const { whatsapp } = await CreateWhatsAppService(pageConection);

      io.emit(`company-${companyId}-whatsapp`, {
        action: "update",
        whatsapp
      });
    }
  }
  return res.status(200);
};



export const show = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const { session } = req.query;

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId, session);

  return res.status(200).json(whatsapp);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const whatsappData = req.body;
  const { companyId } = req.user;

  const { whatsapp, oldDefaultWhatsapp } = await UpdateWhatsAppService({
    whatsappData,
    whatsappId,
    companyId
  });

  const io = getIO();
  io.emit(`company-${companyId}-whatsapp`, {
    action: "update",
    whatsapp
  });

  if (oldDefaultWhatsapp) {
    io.emit(`company-${companyId}-whatsapp`, {
      action: "update",
      whatsapp: oldDefaultWhatsapp
    });
  }

  return res.status(200).json(whatsapp);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId } = req.params;
  const { companyId } = req.user;
  const io = getIO();

  const whatsapp = await ShowWhatsAppService(whatsappId, companyId);

  if (whatsapp.channel === "whatsapp") {
    await DeleteBaileysService(whatsappId);
    await DeleteWhatsAppService(whatsappId);
    await cacheLayer.delFromPattern(`sessions:${whatsappId}:*`);
    removeWbot(+whatsappId);

    io.emit(`company-${companyId}-whatsapp`, {
      action: "delete",
      whatsappId: +whatsappId
    });

  }

  if (whatsapp.channel === "facebook" || whatsapp.channel === "instagram") {
    const { facebookUserToken } = whatsapp;

    const getAllSameToken = await Whatsapp.findAll({

      where: {
        facebookUserToken
      }
    });

    await Whatsapp.destroy({
      where: {
        facebookUserToken
      }
    });

    for await (const whatsapp of getAllSameToken) {
      io.emit(`company-${companyId}-whatsapp`, {
        action: "delete",
        whatsappId: whatsapp.id
      });
    }

  }

  return res.status(200).json({ message: "Session disconnected." });
};
