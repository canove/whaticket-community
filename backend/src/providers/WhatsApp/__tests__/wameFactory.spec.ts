describe("wame provider registration", () => {
  it("exposes all WhatsappProvider interface methods", () => {
    const { WameProvider } = require("../Implementations/wame");
    const methods = [
      "init", "removeSession", "logout", "sendMessage", "sendMedia",
      "deleteMessage", "checkNumber", "getProfilePicUrl", "getContacts",
      "sendSeen", "fetchChatMessages"
    ];
    methods.forEach(m => expect(typeof WameProvider[m]).toBe("function"));
  });
});
