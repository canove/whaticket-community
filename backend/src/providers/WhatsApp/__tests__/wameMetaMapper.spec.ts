import {
  parseMetaWebhook,
  mapMetaAck,
  isMetaWebhook
} from "../Implementations/wameMetaMapper";

const metaEnvelope = (value: any) => ({
  object: "wame",
  entry: [{ id: "wame.x", changes: [{ field: "messages", value }] }]
});

describe("isMetaWebhook", () => {
  it("detects the Meta envelope by { object, entry }", () => {
    expect(isMetaWebhook(metaEnvelope({}))).toBe(true);
    expect(isMetaWebhook({ type: "connection", data: {} })).toBe(false);
    expect(isMetaWebhook(null)).toBe(false);
  });
});

describe("mapMetaAck", () => {
  it("maps Cloud API status to whaticket ack", () => {
    expect(mapMetaAck("sent")).toBe(1);
    expect(mapMetaAck("delivered")).toBe(2);
    expect(mapMetaAck("read")).toBe(3);
    expect(mapMetaAck("played")).toBe(4);
    expect(mapMetaAck("failed")).toBe(0);
  });
});

describe("parseMetaWebhook", () => {
  it("parses an incoming text message with contact name", () => {
    const body = metaEnvelope({
      messaging_product: "whatsapp",
      metadata: { display_phone_number: "5566996852025", phone_number_id: "509" },
      contacts: [{ profile: { name: "Fulano" }, wa_id: "5511999998888" }],
      messages: [
        {
          from: "5511999998888",
          id: "WAMID1",
          timestamp: "1700000000",
          type: "text",
          text: { body: "Olá!" }
        }
      ]
    });

    const { messages, statuses } = parseMetaWebhook(body, 7);
    expect(statuses).toHaveLength(0);
    expect(messages).toHaveLength(1);

    const { message, contact, context } = messages[0];
    expect(message).toMatchObject({
      id: "WAMID1",
      body: "Olá!",
      type: "chat",
      fromMe: false,
      from: "5511999998888",
      to: "5566996852025",
      hasMedia: false
    });
    expect(message.timestamp).toBe(1700000000);
    expect(contact).toEqual({
      name: "Fulano",
      number: "5511999998888",
      isGroup: false
    });
    expect(context).toMatchObject({ whatsappId: 7, unreadMessages: 1 });
  });

  it("parses an image message as media", () => {
    const body = metaEnvelope({
      metadata: { display_phone_number: "5566996852025" },
      messages: [
        {
          from: "5511999998888",
          id: "WAMID2",
          timestamp: "1700000001",
          type: "image",
          image: { id: "M1", mime_type: "image/jpeg", caption: "foto" }
        }
      ]
    });
    const { messages } = parseMetaWebhook(body, 7);
    expect(messages[0].message).toMatchObject({
      type: "image",
      hasMedia: true,
      body: "foto"
    });
  });

  it("parses statuses into acks", () => {
    const body = metaEnvelope({
      metadata: { display_phone_number: "5566996852025" },
      statuses: [{ id: "WAMID1", status: "read" }]
    });
    const { messages, statuses } = parseMetaWebhook(body, 7);
    expect(messages).toHaveLength(0);
    expect(statuses).toEqual([{ messageId: "WAMID1", ack: 3 }]);
  });
});
