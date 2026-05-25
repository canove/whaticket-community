import Whatsapp from "../models/Whatsapp.js";
import {
  InstagramSession,
  parseInstagramSession,
  unsubscribeInstagramWebhooks,
  emitSessionUpdate
} from "./instagram.js";
import { MetaSessionRegistry } from "./metaSessionRegistry.js";

// ─── Registry ────────────────────────────────────────────────────────────────

export const instagramSessionRegistry =
  new MetaSessionRegistry<InstagramSession>(
    s => s.instagramAccountId,
    async () => {
      const conns = await Whatsapp.findAll({
        where: { channel: "instagram", status: "CONNECTED" }
      });
      return conns
        .map(c => ({ id: c.id, session: parseInstagramSession(c.session) }))
        .filter(
          (r): r is { id: number; session: InstagramSession } =>
            r.session !== null
        );
    }
  );

export const resolveWhatsappIdByInstagramAccount = (instagramAccountId: string) =>
  instagramSessionRegistry.resolveBySecondaryKey(instagramAccountId);

// ─── Disconnect helper (unsubscribe + cleanup + DB update + socket emit) ─────

export const disconnectInstagramConnection = async (
  whatsapp: Whatsapp
): Promise<void> => {
  const session = parseInstagramSession(whatsapp.session);
  if (session) {
    await unsubscribeInstagramWebhooks(session.accessToken);
  }
  instagramSessionRegistry.remove(whatsapp.id);
  await whatsapp.update({ status: "WAITING_LOGIN", session: "" });
  emitSessionUpdate(whatsapp);
};
