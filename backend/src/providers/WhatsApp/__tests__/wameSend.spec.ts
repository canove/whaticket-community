// backend/src/providers/WhatsApp/__tests__/wameSend.spec.ts
//
// Real SDK method signatures used (from @raphaelvserafim/client-api-whatsapp dist/services/MessageService.d.ts):
//   message.send({ type: TypeMessage, body: { to, text? } }): Promise<SendMessageRoot>
//   message.sendImageBase64(to: string, base64: string, caption?: string): Promise<SendMessageRoot>
//   message.sendAudioBase64(to: string, base64: string): Promise<SendMessageRoot>
//   message.sendDocumentBase64(to: string, base64: string, mimetype: string, fileName?: string, caption?: string): Promise<SendMessageRoot>
//   SendMessageRoot = { status: number; data?: { key: { remoteJid, fromMe, id }, message, messageTimestamp, status } }

const sendMock = jest.fn(async () => ({
  status: 200,
  data: { key: { id: "SENT1", remoteJid: "5511999998888", fromMe: true }, message: {}, messageTimestamp: "1700000000", status: "SENT" }
}));
const sendImageBase64Mock = jest.fn(async () => ({
  status: 200,
  data: { key: { id: "SENT_IMG", remoteJid: "5511999998888", fromMe: true }, message: {}, messageTimestamp: "1700000001", status: "SENT" }
}));
const sendAudioBase64Mock = jest.fn(async () => ({
  status: 200,
  data: { key: { id: "SENT_AUD", remoteJid: "5511999998888", fromMe: true }, message: {}, messageTimestamp: "1700000002", status: "SENT" }
}));
const sendDocumentBase64Mock = jest.fn(async () => ({
  status: 200,
  data: { key: { id: "SENT_DOC", remoteJid: "5511999998888", fromMe: true }, message: {}, messageTimestamp: "1700000003", status: "SENT" }
}));

jest.mock("@raphaelvserafim/client-api-whatsapp", () => ({
  WhatsApp: class {
    message = {
      send: sendMock,
      sendImageBase64: sendImageBase64Mock,
      sendAudioBase64: sendAudioBase64Mock,
      sendDocumentBase64: sendDocumentBase64Mock,
      getMedia: jest.fn()
    };
    instance = {
      updateWebhook: jest.fn(),
      connect: jest.fn(),
      logout: jest.fn()
    };
  },
  TypeMessage: {
    TEXT: "text",
    IMAGE: "image",
    VIDEO: "video",
    AUDIO: "audio",
    DOCUMENT: "document",
    PRESENCE: "presence"
  }
}));

import { WameProvider, __setSessionForTest } from "../Implementations/wame";

describe("wame sendMessage", () => {
  beforeEach(() => {
    sendMock.mockClear();
    sendImageBase64Mock.mockClear();
    sendAudioBase64Mock.mockClear();
    sendDocumentBase64Mock.mockClear();
  });

  it("calls message.send with TypeMessage.TEXT and correct body, returns ProviderMessage", async () => {
    __setSessionForTest(1);
    const r = await WameProvider.sendMessage(1, "5511999998888", "oi");

    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "text",
        body: expect.objectContaining({ to: "5511999998888", text: "oi" })
      })
    );
    expect(r).toMatchObject({
      id: "SENT1",
      body: "oi",
      fromMe: true,
      hasMedia: false,
      to: "5511999998888"
    });
    // media methods must NOT be called
    expect(sendImageBase64Mock).not.toHaveBeenCalled();
    expect(sendAudioBase64Mock).not.toHaveBeenCalled();
    expect(sendDocumentBase64Mock).not.toHaveBeenCalled();
  });
});

describe("wame sendMedia", () => {
  beforeEach(() => {
    sendMock.mockClear();
    sendImageBase64Mock.mockClear();
    sendAudioBase64Mock.mockClear();
    sendDocumentBase64Mock.mockClear();
  });

  it("sends image via sendImageBase64 for image/jpeg", async () => {
    __setSessionForTest(2);
    const r = await WameProvider.sendMedia(
      2,
      "5511999998888",
      { filename: "photo.jpg", mimetype: "image/jpeg", data: Buffer.from("imgdata") },
      { caption: "minha foto" }
    );

    expect(sendImageBase64Mock).toHaveBeenCalledTimes(1);
    expect(sendImageBase64Mock).toHaveBeenCalledWith(
      "5511999998888",
      Buffer.from("imgdata").toString("base64"),
      "minha foto"
    );
    expect(r).toMatchObject({ id: "SENT_IMG", fromMe: true, hasMedia: true });
    // other media methods must NOT be called
    expect(sendMock).not.toHaveBeenCalled();
    expect(sendAudioBase64Mock).not.toHaveBeenCalled();
    expect(sendDocumentBase64Mock).not.toHaveBeenCalled();
  });

  it("sends audio via sendAudioBase64 for audio/ogg", async () => {
    __setSessionForTest(3);
    const r = await WameProvider.sendMedia(
      3,
      "5511999998888",
      { filename: "voice.ogg", mimetype: "audio/ogg", data: Buffer.from("audiodata") }
    );

    expect(sendAudioBase64Mock).toHaveBeenCalledTimes(1);
    expect(sendAudioBase64Mock).toHaveBeenCalledWith(
      "5511999998888",
      Buffer.from("audiodata").toString("base64")
    );
    expect(r).toMatchObject({ id: "SENT_AUD", fromMe: true, hasMedia: true });
    expect(sendMock).not.toHaveBeenCalled();
    expect(sendImageBase64Mock).not.toHaveBeenCalled();
    expect(sendDocumentBase64Mock).not.toHaveBeenCalled();
  });

  it("sends video via sendDocumentBase64 (SDK has no video base64 method)", async () => {
    __setSessionForTest(4);
    const r = await WameProvider.sendMedia(
      4,
      "5511999998888",
      { filename: "clip.mp4", mimetype: "video/mp4", data: Buffer.from("videodata") },
      { caption: "vídeo" }
    );

    expect(sendDocumentBase64Mock).toHaveBeenCalledTimes(1);
    expect(sendDocumentBase64Mock).toHaveBeenCalledWith(
      "5511999998888",
      Buffer.from("videodata").toString("base64"),
      "video/mp4",
      "clip.mp4",
      "vídeo"
    );
    expect(r).toMatchObject({ id: "SENT_DOC", fromMe: true, hasMedia: true });
    expect(sendMock).not.toHaveBeenCalled();
    expect(sendImageBase64Mock).not.toHaveBeenCalled();
    expect(sendAudioBase64Mock).not.toHaveBeenCalled();
  });

  it("sends PDF document via sendDocumentBase64", async () => {
    __setSessionForTest(5);
    const r = await WameProvider.sendMedia(
      5,
      "5511999998888",
      { filename: "nota.pdf", mimetype: "application/pdf", data: Buffer.from("pdfdata") }
    );

    expect(sendDocumentBase64Mock).toHaveBeenCalledTimes(1);
    expect(sendDocumentBase64Mock).toHaveBeenCalledWith(
      "5511999998888",
      Buffer.from("pdfdata").toString("base64"),
      "application/pdf",
      "nota.pdf",
      undefined  // no caption
    );
    expect(r).toMatchObject({ id: "SENT_DOC", fromMe: true, hasMedia: true });
  });
});
