import { randomBytes } from "crypto";
import { sign, verify } from "jsonwebtoken";
import { Response } from "express";
import authConfig from "../../../config/auth";
import AppError from "../../../errors/AppError";
import { createRefreshToken } from "../../../helpers/CreateTokens";
import User from "../../../models/User";

const showUser = jest.fn();
jest.doMock("../../../services/UserServices/ShowUserService", () => ({
  __esModule: true,
  default: showUser
}));

// Load after the non-hoisted mock: the service's database lookup stays synthetic.
/* eslint-disable @typescript-eslint/no-var-requires, global-require, import/newline-after-import */
const {
  RefreshTokenService
} = require("../../../services/AuthServices/RefreshTokenService");
/* eslint-enable @typescript-eslint/no-var-requires, global-require, import/newline-after-import */
const user = {
  id: 42,
  name: "Synthetic user",
  profile: "user",
  tokenVersion: 3
} as User;

describe("RefreshTokenService", () => {
  beforeEach(() => {
    showUser.mockReset();
    showUser.mockResolvedValue(user);
  });

  it("renews only a valid refresh token with the current token version", async () => {
    const res = { clearCookie: jest.fn() } as unknown as Response;
    const result = await RefreshTokenService(res, createRefreshToken(user));

    expect(result.user).toBe(user);
    expect(
      verify(result.newToken, authConfig.secret, { algorithms: ["HS256"] })
    ).toMatchObject({ id: 42 });
    expect(
      verify(result.refreshToken, authConfig.refreshSecret, {
        algorithms: ["HS256"]
      })
    ).toMatchObject({ id: 42, tokenVersion: 3 });
    expect(res.clearCookie).not.toHaveBeenCalled();
  });

  it.each([
    [
      "invalid signature",
      () => sign({ id: 42, tokenVersion: 3 }, randomBytes(32).toString("hex"))
    ],
    [
      "expired token",
      () =>
        sign({ id: 42, tokenVersion: 3 }, authConfig.refreshSecret, {
          expiresIn: -1
        })
    ]
  ])("rejects a refresh token with %s", async (_description, createToken) => {
    const res = { clearCookie: jest.fn() } as unknown as Response;

    await expect(
      RefreshTokenService(res, createToken())
    ).rejects.toBeInstanceOf(AppError);
    expect(res.clearCookie).toHaveBeenCalledWith("jrt");
  });

  it("rejects a tokenVersion that was revoked", async () => {
    const token = sign({ id: 42, tokenVersion: 2 }, authConfig.refreshSecret, {
      expiresIn: "7d",
      algorithm: "HS256"
    });
    const res = { clearCookie: jest.fn() } as unknown as Response;

    await expect(RefreshTokenService(res, token)).rejects.toBeInstanceOf(
      AppError
    );
    expect(res.clearCookie).toHaveBeenCalledWith("jrt");
  });
});
