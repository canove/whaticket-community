import { randomBytes } from "crypto";
import { sign, verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../../../models/User";
import authConfig from "../../../config/auth";
import {
  createAccessToken,
  createRefreshToken
} from "../../../helpers/CreateTokens";
import isAuth from "../../../middleware/isAuth";
import AppError from "../../../errors/AppError";

const user = {
  id: 42,
  name: "Synthetic user",
  profile: "user",
  tokenVersion: 3
} as User;

describe("JWT authentication flows", () => {
  it("signs and accepts legitimate access tokens using HS256", () => {
    const token = createAccessToken(user);
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;
    const next = jest.fn() as NextFunction;

    isAuth(req, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user).toEqual({ id: 42, profile: "user" });
    expect(
      verify(token, authConfig.secret, { algorithms: ["HS256"] })
    ).toMatchObject({ id: 42 });
  });

  it("rejects access tokens signed with a different key", () => {
    const token = sign(
      { id: 42, profile: "admin" },
      randomBytes(32).toString("hex")
    );
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;

    expect(() => isAuth(req, {} as Response, jest.fn())).toThrow(AppError);
  });

  it("rejects access tokens signed with an unapproved algorithm", () => {
    const token = sign({ id: 42, profile: "admin" }, authConfig.secret, {
      algorithm: "HS384"
    });
    const req = { headers: { authorization: `Bearer ${token}` } } as Request;

    expect(() => isAuth(req, {} as Response, jest.fn())).toThrow(AppError);
  });

  it("signs refresh tokens with the separate HS256 key and expected expiry", () => {
    const token = createRefreshToken(user);

    expect(
      verify(token, authConfig.refreshSecret, { algorithms: ["HS256"] })
    ).toMatchObject({
      id: 42,
      tokenVersion: 3
    });
  });
});
