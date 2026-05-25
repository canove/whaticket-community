import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp.js";
import { logger } from "../utils/logger.js";
import {
  graphGet,
  graphPost,
  parseWhatsAppCloudSession,
  WhatsAppCloudSession
} from "../helpers/whatsappCloud.js";
import {
  whatsappCloudSessionRegistry,
  disconnectWhatsAppCloudConnection
} from "../helpers/whatsappCloudSessionRegistry.js";
import { emitWhatsappSessionUpdate } from "../helpers/emitWhatsappSessionUpdate.js";

// ─── POST /whatsapp-cloud/connect ────────────────────────────────────────────

const connect = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId, phoneNumberId, wabaId, accessToken } = req.body;

  if (!whatsappId || !phoneNumberId || !wabaId || !accessToken) {
    return res.status(400).json({ error: "whatsappId, phoneNumberId, wabaId e accessToken são obrigatórios" });
  }

  const whatsapp = await Whatsapp.findByPk(Number(whatsappId));
  if (!whatsapp || whatsapp.channel !== "whatsapp_cloud") {
    return res.status(404).json({ error: "Conexão não encontrada" });
  }

  let displayPhoneNumber: string | undefined;
  let verifiedName: string | undefined;

  try {
    const data = await graphGet<{
      id: string;
      display_phone_number?: string;
      verified_name?: string;
    }>(`/${phoneNumberId}`, accessToken, {
      fields: "id,display_phone_number,verified_name"
    });
    displayPhoneNumber = data.display_phone_number;
    verifiedName = data.verified_name;
  } catch (err) {
    logger.warn({ info: "WhatsApp Cloud: connect validation failed", whatsappId, err });
    return res.status(400).json({ error: "Token inválido ou Phone Number ID incorreto. Verifique as credenciais." });
  }

  const session: WhatsAppCloudSession = {
    phoneNumberId,
    wabaId,
    accessToken,
    displayPhoneNumber,
    verifiedName
  };

  await whatsapp.update({
    status: "CONNECTED",
    session: JSON.stringify(session),
    name: whatsapp.name || verifiedName || displayPhoneNumber || phoneNumberId
  });

  whatsappCloudSessionRegistry.load(whatsapp.id, session);
  emitWhatsappSessionUpdate(whatsapp);

  logger.info({
    info: "WhatsApp Cloud: connected",
    whatsappId,
    phoneNumberId,
    displayPhoneNumber
  });

  return res.json({ ok: true, displayPhoneNumber, verifiedName });
};

// ─── POST /whatsapp-cloud/disconnect ─────────────────────────────────────────

const disconnect = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.body;
  if (!whatsappId) {
    return res.status(400).json({ error: "whatsappId é obrigatório" });
  }

  const whatsapp = await Whatsapp.findByPk(Number(whatsappId));
  if (!whatsapp || whatsapp.channel !== "whatsapp_cloud") {
    return res.status(404).json({ error: "Conexão não encontrada" });
  }

  await disconnectWhatsAppCloudConnection(whatsapp);
  return res.json({ ok: true });
};

// ─── GET /whatsapp-cloud/diagnose ─────────────────────────────────────────────

const diagnose = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId } = req.query;
  if (!whatsappId) {
    return res.status(400).json({ error: "whatsappId é obrigatório" });
  }

  const whatsapp = await Whatsapp.findByPk(Number(whatsappId));
  if (!whatsapp || whatsapp.channel !== "whatsapp_cloud") {
    return res.status(404).json({ error: "Conexão não encontrada" });
  }

  const session = parseWhatsAppCloudSession(whatsapp.session);
  if (!session) {
    return res.status(400).json({ error: "Nenhuma sessão configurada" });
  }

  const result = await graphGet<{
    id?: string;
    display_phone_number?: string;
    verified_name?: string;
    quality_rating?: string;
  }>(`/${session.phoneNumberId}`, session.accessToken, {
    fields: "id,display_phone_number,verified_name,quality_rating"
  }).then(data => ({ ok: true, ...data })).catch(err => ({
    ok: false,
    error: err?.response?.data?.error?.message || err.message
  }));

  return res.json({ phoneNumberId: session.phoneNumberId, wabaId: session.wabaId, ...result });
};

// ─── POST /whatsapp-cloud/register ───────────────────────────────────────────
// Registers the phone number with Cloud API (required before sending messages).
// PIN is the 6-digit Two-step verification PIN configured in WhatsApp Manager.

const register = async (req: Request, res: Response): Promise<Response> => {
  const { whatsappId, pin } = req.body;

  if (!whatsappId || !pin) {
    return res.status(400).json({ error: "whatsappId e pin são obrigatórios" });
  }
  if (!/^\d{6}$/.test(String(pin))) {
    return res.status(400).json({ error: "PIN deve conter exatamente 6 dígitos numéricos" });
  }

  const whatsapp = await Whatsapp.findByPk(Number(whatsappId));
  if (!whatsapp || whatsapp.channel !== "whatsapp_cloud") {
    return res.status(404).json({ error: "Conexão não encontrada" });
  }

  const session = parseWhatsAppCloudSession(whatsapp.session);
  if (!session) {
    return res.status(400).json({ error: "Conexão não configurada. Conecte primeiro." });
  }

  try {
    await graphPost(`/${session.phoneNumberId}/register`, session.accessToken, {
      messaging_product: "whatsapp",
      pin: String(pin)
    });
  } catch (err: any) {
    const meta = err?.response?.data?.error;
    logger.warn({ info: "WhatsApp Cloud: register failed", whatsappId, meta });

    if (typeof meta?.message === "string" && meta.message.includes("SMB businesses")) {
      return res.status(400).json({
        error:
          "Sua conta é SMB (WhatsApp Business). O endpoint /register não está disponível — o registro é automático via WhatsApp Manager. Acesse business.facebook.com/wa/manage, abra o número, complete a verificação SMS/voz e configure o PIN de 2FA. Depois disso, mensagens funcionam sem precisar registrar via API.",
        code: meta?.code,
        smb: true
      });
    }

    return res.status(400).json({
      error: meta?.message || "Falha ao registrar número. Verifique o PIN e tente novamente.",
      code: meta?.code
    });
  }

  logger.info({
    info: "WhatsApp Cloud: phone registered",
    whatsappId,
    phoneNumberId: session.phoneNumberId
  });

  return res.json({ ok: true });
};

export default { connect, disconnect, diagnose, register };
