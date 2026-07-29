/**
 * Task 7 — wameMisc.spec.ts
 *
 * Tests for deleteMessage, checkNumber, getProfilePicUrl, sendSeen, getContacts,
 * fetchChatMessages — all implemented against the REAL SDK signatures found in
 * node_modules/@raphaelvserafim/client-api-whatsapp/dist/types/index.d.ts and
 * the service .d.ts files.
 *
 * Real SDK signatures used:
 *   - wa.action.checkRegistered(number: string): Promise<RegisteredResponse>
 *       RegisteredResponse = { status: number; registered: boolean }
 *   - wa.contact.profile(id: string): Promise<{ status: number; data: ContactInfo }>
 *       ContactInfo = { id: string; name?: string; notify?: string; imgUrl?: string }
 *   - wa.message.send({ type: TypeMessage.PRESENCE, body: { to, status: StatusPresence.AVAILABLE } })
 *       TypeMessage.PRESENCE = "presence"; StatusPresence.AVAILABLE = "available"
 *   - wa.chat.delete(chatId: string): Promise<ApiResponse>
 *       (SDK has no message-level delete; deleteMessage is best-effort via chat.delete or no-op)
 */

// ── Mock must be declared BEFORE any imports of the mocked module ──

const checkRegisteredMock = jest.fn();
const contactProfileMock = jest.fn();
const messageSendMock = jest.fn();
const chatDeleteMock = jest.fn();

jest.mock("@raphaelvserafim/client-api-whatsapp", () => ({
  WhatsApp: class {
    action = { checkRegistered: checkRegisteredMock };
    contact = { profile: contactProfileMock };
    message = {
      send: messageSendMock,
      getMedia: jest.fn(),
      sendImageBase64: jest.fn(),
      sendAudioBase64: jest.fn(),
      sendDocumentBase64: jest.fn(),
      markRead: jest.fn()
    };
    chat = { delete: chatDeleteMock };
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
  },
  StatusPresence: {
    AVAILABLE: "available",
    COMPOSING: "composing",
    UNAVAILABLE: "unavailable",
    RECORDING: "recording",
    PAUSED: "paused"
  }
}));

// Stub out heavy app-level deps
jest.mock("../../../libs/socket", () => ({ getIO: () => ({ emit: jest.fn() }) }));
jest.mock("../../../models/Whatsapp", () => ({
  __esModule: true,
  default: { findByPk: jest.fn(async () => ({ id: 1, update: jest.fn() })) }
}));
jest.mock("../../../utils/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() }
}));

import { WameProvider, __setSessionForTest } from "../Implementations/wame";

// ── checkNumber ────────────────────────────────────────────────────────────────

describe("checkNumber", () => {
  beforeEach(() => {
    checkRegisteredMock.mockReset();
    __setSessionForTest(1);
  });

  it("returns the digits string when the number is registered", async () => {
    // Real SDK response shape: { status: 200, registered: true }
    checkRegisteredMock.mockResolvedValueOnce({ status: 200, registered: true });

    const result = await WameProvider.checkNumber(1, "55 11 99999-8888");
    expect(result).toBe("5511999998888");
    expect(checkRegisteredMock).toHaveBeenCalledWith("5511999998888");
  });

  it("throws when registered is false", async () => {
    checkRegisteredMock.mockResolvedValueOnce({ status: 200, registered: false });

    await expect(WameProvider.checkNumber(1, "5511999998888")).rejects.toThrow(
      "wame: number not registered"
    );
  });
});

// ── getProfilePicUrl ───────────────────────────────────────────────────────────

describe("getProfilePicUrl", () => {
  beforeEach(() => {
    contactProfileMock.mockReset();
    __setSessionForTest(1);
  });

  it("returns imgUrl from the contact profile response", async () => {
    // Real SDK: contact.profile(id) → { status, data: ContactInfo { imgUrl? } }
    contactProfileMock.mockResolvedValueOnce({
      status: 200,
      data: { id: "5511999998888", name: "Fulano", imgUrl: "https://example.com/pic.jpg" }
    });

    const url = await WameProvider.getProfilePicUrl(1, "5511999998888");
    expect(url).toBe("https://example.com/pic.jpg");
    expect(contactProfileMock).toHaveBeenCalledWith("5511999998888");
  });

  it("returns empty string when imgUrl is absent", async () => {
    contactProfileMock.mockResolvedValueOnce({ status: 200, data: { id: "5511999998888" } });

    const url = await WameProvider.getProfilePicUrl(1, "5511999998888");
    expect(url).toBe("");
  });

  it("returns empty string on network error (best-effort)", async () => {
    contactProfileMock.mockRejectedValueOnce(new Error("network"));

    const url = await WameProvider.getProfilePicUrl(1, "5511999998888");
    expect(url).toBe("");
  });
});

// ── sendSeen ──────────────────────────────────────────────────────────────────

describe("sendSeen", () => {
  beforeEach(() => {
    messageSendMock.mockReset();
    __setSessionForTest(1);
  });

  it("calls message.send with TypeMessage.PRESENCE and StatusPresence.AVAILABLE", async () => {
    messageSendMock.mockResolvedValueOnce({ status: 200 });

    await WameProvider.sendSeen(1, "5511999998888");

    expect(messageSendMock).toHaveBeenCalledWith({
      type: "presence",
      body: { to: "5511999998888", status: "available" }
    });
  });

  it("does not throw on error (best-effort)", async () => {
    messageSendMock.mockRejectedValueOnce(new Error("not supported"));

    await expect(WameProvider.sendSeen(1, "5511999998888")).resolves.toBeUndefined();
  });
});

// ── deleteMessage ─────────────────────────────────────────────────────────────

describe("deleteMessage", () => {
  beforeEach(() => {
    chatDeleteMock.mockReset();
    __setSessionForTest(1);
  });

  it("is a safe no-op — never deletes the whole chat (SDK has no per-message delete)", async () => {
    await WameProvider.deleteMessage(1, "5511999998888", "MSG_ID_123", false);
    expect(chatDeleteMock).not.toHaveBeenCalled();
  });

  it("does not throw (best-effort)", async () => {
    await expect(
      WameProvider.deleteMessage(1, "5511999998888", "MSG_ID_123", true)
    ).resolves.toBeUndefined();
  });
});

// ── getContacts / fetchChatMessages (best-effort empty MVP) ──────────────────

describe("getContacts and fetchChatMessages (MVP stubs)", () => {
  beforeEach(() => {
    __setSessionForTest(1);
  });

  it("getContacts returns an empty array", async () => {
    const contacts = await WameProvider.getContacts(1);
    expect(contacts).toEqual([]);
  });

  it("fetchChatMessages returns an empty array", async () => {
    const messages = await WameProvider.fetchChatMessages(1, "5511999998888", 20);
    expect(messages).toEqual([]);
  });
});
