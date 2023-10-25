import {
  BufferJSON,
  LegacyAuthenticationCreds,
  newLegacyAuthCreds
} from "@adiwajshing/baileys";
import Whatsapp from "../models/Whatsapp";

export const authStateLegacy = async (whatsapp: Whatsapp) => {
  const updateWhatsappData = await Whatsapp.findOne({
    where: {
      id: whatsapp.id
    }
  });
  let state: LegacyAuthenticationCreds;
  if (updateWhatsappData?.session) {
    state = JSON.parse(updateWhatsappData?.session, BufferJSON.reviver);
    if (typeof state.encKey === "string") {
      state.encKey = Buffer.from(state.encKey, "base64");
    }

    if (typeof state.macKey === "string") {
      state.macKey = Buffer.from(state.macKey, "base64");
    }
  } else {
    state = newLegacyAuthCreds();
  }

  return {
    state,
    saveState: async () => {
      const str = JSON.stringify(state, BufferJSON.replacer, 2);
      await whatsapp.update({
        session: str
      });
    }
  };
};

export default authStateLegacy;
