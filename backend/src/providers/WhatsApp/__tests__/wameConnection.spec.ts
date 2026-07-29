const mockUpdate = jest.fn();
const mockEmit = jest.fn();
jest.mock("../../../libs/socket", () => ({ getIO: () => ({ emit: mockEmit }) }));
jest.mock("../../../models/Whatsapp", () => ({
  __esModule: true,
  default: { findByPk: jest.fn(async () => ({ id: 1, update: mockUpdate })) }
}));

import { wameConnectionUpdate, wameQrUpdate } from "../Implementations/wame";

describe("wame connection/qr updates", () => {
  beforeEach(() => { mockUpdate.mockClear(); mockEmit.mockClear(); });

  it("open connection sets CONNECTED and clears qrcode", async () => {
    await wameConnectionUpdate(1, "open", {});
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "CONNECTED", qrcode: "" }));
    expect(mockEmit).toHaveBeenCalledWith("whatsappSession", expect.anything());
  });

  it("close connection sets DISCONNECTED", async () => {
    await wameConnectionUpdate(1, "close", {});
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ status: "DISCONNECTED" }));
  });

  it("qr update stores qrcode and emits qrcode status", async () => {
    await wameQrUpdate(1, "data:image/png;base64,AAA");
    expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ qrcode: "data:image/png;base64,AAA", status: "qrcode" }));
    expect(mockEmit).toHaveBeenCalledWith("whatsappSession", expect.anything());
  });
});
