import { handleWameWebhook } from "../HandleWameWebhook";

describe("handleWameWebhook", () => {
  const base = () => ({
    onMessage: jest.fn(),
    onAck: jest.fn(),
    onConnection: jest.fn(),
    onQrcode: jest.fn(),
    getMedia: jest.fn()
  });

  it("routes a text message to onMessage with mapped payloads", async () => {
    const deps = base();
    await handleWameWebhook(7, {
      type: "message",
      data: {
        messageId: "W1", from: "5511999998888", to: "556699",
        me: false, isGroup: false, isMedia: false,
        messageType: "conversation", msgContent: { conversation: "oi" },
        pushName: "Fulano", messageTimestamp: 1700000000, status: 3
      }
    }, deps);
    expect(deps.onMessage).toHaveBeenCalledTimes(1);
    const [msg, contact, ctx, media] = deps.onMessage.mock.calls[0];
    expect(msg).toMatchObject({ id: "W1", body: "oi", type: "chat" });
    expect(contact.number).toBe("5511999998888");
    expect(ctx.whatsappId).toBe(7);
    expect(media).toBeUndefined();
  });

  it("fetches media for media messages", async () => {
    const deps = base();
    deps.getMedia.mockResolvedValue({ base64: "QUJD", mimetype: "image/jpeg" });
    await handleWameWebhook(7, {
      type: "message",
      data: {
        messageId: "W2", from: "5511999998888", to: "556699",
        me: false, isGroup: false, isMedia: true,
        messageType: "imageMessage",
        msgContent: { imageMessage: { caption: "foto", mimetype: "image/jpeg" } },
        pushName: "Fulano", messageTimestamp: 1700000001, status: 3
      }
    }, deps);
    expect(deps.getMedia).toHaveBeenCalledWith("W2");
    const media = deps.onMessage.mock.calls[0][3];
    expect(media).toMatchObject({ mimetype: "image/jpeg", data: "QUJD" });
  });

  it("routes messageStatus to onAck", async () => {
    const deps = base();
    await handleWameWebhook(7, {
      type: "messageStatus",
      data: { messageId: "W1", status: 4 }
    }, deps);
    expect(deps.onAck).toHaveBeenCalledWith("W1", 3);
  });

  it("routes connection and qrcode", async () => {
    const deps = base();
    await handleWameWebhook(7, { type: "connection", data: { status: "open" } }, deps);
    expect(deps.onConnection).toHaveBeenCalledWith("open", expect.anything());
    await handleWameWebhook(7, { type: "qrcode", data: { code: "data:image/png;base64,AAA" } }, deps);
    expect(deps.onQrcode).toHaveBeenCalledWith("data:image/png;base64,AAA");
  });
});
