const query = jest.fn().mockResolvedValue([]);
const queryInterface = {
  quoteIdentifier: (value: string): string => `\`${value}\``,
  quoteTable: (value: string): string => `\`${value}\``
};

jest.doMock("../../../database", () => ({
  __esModule: true,
  default: {
    getQueryInterface: () => queryInterface,
    query
  }
}));

/* eslint-disable @typescript-eslint/no-var-requires, global-require, import/newline-after-import */
const {
  default: RevokeUserSessions
} = require("../../../services/AuthServices/RevokeUserSessions");
/* eslint-enable @typescript-eslint/no-var-requires, global-require, import/newline-after-import */

describe("RevokeUserSessions", () => {
  it("atomically increments the user's token version with a bound id", async () => {
    await RevokeUserSessions("42");

    expect(query).toHaveBeenCalledWith(
      "UPDATE `Users` SET `tokenVersion` = `tokenVersion` + 1 WHERE `id` = :id",
      { replacements: { id: "42" } }
    );
  });
});
