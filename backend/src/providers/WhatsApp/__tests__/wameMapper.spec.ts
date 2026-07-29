import {
  mapWameContent,
  mapWameAck,
  mapWameMessage
} from "../Implementations/wameMapper";

describe("mapWameContent", () => {
  it("maps plain text (conversation)", () => {
    const r = mapWameContent("conversation", { conversation: "Olá!" });
    expect(r).toEqual({ body: "Olá!", type: "chat", hasMedia: false, sendAudioAsVoice: false });
  });

  it("maps extendedTextMessage", () => {
    const r = mapWameContent("extendedTextMessage", {
      extendedTextMessage: { text: "com link https://x.com" }
    });
    expect(r.type).toBe("chat");
    expect(r.body).toBe("com link https://x.com");
  });

  it("maps image with caption as media", () => {
    const r = mapWameContent("imageMessage", {
      imageMessage: { caption: "foto", mimetype: "image/jpeg" }
    });
    expect(r).toMatchObject({ body: "foto", type: "image", hasMedia: true });
  });

  it("maps ptt audio as voice", () => {
    const r = mapWameContent("audioMessage", {
      audioMessage: { ptt: true, mimetype: "audio/ogg" }
    });
    expect(r).toMatchObject({ type: "ptt", hasMedia: true, sendAudioAsVoice: true });
  });

  it("maps document with fileName fallback", () => {
    const r = mapWameContent("documentMessage", {
      documentMessage: { fileName: "nota.pdf", mimetype: "application/pdf" }
    });
    expect(r).toMatchObject({ body: "nota.pdf", type: "document", hasMedia: true });
  });

  it("maps sticker and location and unknown", () => {
    expect(mapWameContent("stickerMessage", { stickerMessage: {} }).type).toBe("sticker");
    expect(mapWameContent("locationMessage", { locationMessage: { degreesLatitude: 1, degreesLongitude: 2 } }).type).toBe("location");
    expect(mapWameContent("somethingNew", {}).type).toBe("chat");
  });
});

describe("mapWameAck", () => {
  it("maps baileys status to whaticket ack", () => {
    expect(mapWameAck(1)).toBe(0); // PENDING
    expect(mapWameAck(2)).toBe(1); // SERVER
    expect(mapWameAck(3)).toBe(2); // DELIVERY/DEVICE
    expect(mapWameAck(4)).toBe(3); // READ
    expect(mapWameAck(5)).toBe(4); // PLAYED
    expect(mapWameAck(undefined)).toBe(0);
  });
});

describe("mapWameMessage", () => {
  const data = {
    messageId: "WAMID1",
    from: "5511999998888",
    to: "5566996852025",
    me: false,
    isGroup: false,
    isMedia: false,
    messageType: "conversation",
    msgContent: { conversation: "oi" },
    pushName: "Fulano",
    phoneNumber: "5511999998888",
    remoteJid: "5511999998888",
    messageTimestamp: 1700000000,
    status: 3,
    key: { id: "WAMID1", remoteJid: "5511999998888@s.whatsapp.net", fromMe: false }
  };

  it("builds MessagePayload/ContactPayload/context for a private text", () => {
    const r = mapWameMessage(data, 7);
    expect(r.message).toMatchObject({
      id: "WAMID1", body: "oi", fromMe: false, hasMedia: false,
      type: "chat", from: "5511999998888", to: "5566996852025"
    });
    expect(r.message.timestamp).toBe(1700000000);
    expect(r.contact).toEqual({
      name: "Fulano", number: "5511999998888", isGroup: false, lid: undefined
    });
    expect(r.context).toMatchObject({ whatsappId: 7, unreadMessages: 1 });
    expect(r.context.groupContact).toBeUndefined();
  });

  it("sets groupContact when isGroup", () => {
    const g = { ...data, isGroup: true, from: "12036-99@g.us", pushName: "Grupo X" };
    const r = mapWameMessage(g, 7);
    expect(r.contact.isGroup).toBe(true);
    expect(r.context.groupContact?.isGroup).toBe(true);
  });
});
