import { randomBytes } from "crypto";
import { createAuthConfig } from "../../../config/auth";
import requireSecret from "../../../config/requireSecret";

const createSecret = (): string => randomBytes(32).toString("hex");

describe("JWT configuration", () => {
  it("rejects a missing secret", () => {
    expect(() => requireSecret("JWT_SECRET", undefined)).toThrow("JWT_SECRET");
  });

  it("rejects an empty secret", () => {
    expect(() => requireSecret("JWT_SECRET", "")).toThrow("JWT_SECRET");
  });

  it("rejects a short secret", () => {
    expect(() => requireSecret("JWT_SECRET", "a1b2c3")).toThrow("JWT_SECRET");
  });

  it("rejects predictable repeated and low-diversity values", () => {
    expect(() => requireSecret("JWT_SECRET", "a".repeat(64))).toThrow(
      "JWT_SECRET"
    );
    expect(() =>
      requireSecret("JWT_SECRET", "0123456789abcdef".repeat(4))
    ).toThrow("JWT_SECRET");
  });

  it("does not include the rejected value in errors", () => {
    const rejected = "not-a-secret";
    try {
      requireSecret("JWT_SECRET", rejected);
    } catch (error) {
      expect((error as Error).message).not.toContain(rejected);
    }
  });

  it("rejects identical access and refresh key material in different encodings", () => {
    const keyMaterial = randomBytes(32);
    expect(() =>
      createAuthConfig({
        JWT_SECRET: keyMaterial.toString("hex"),
        JWT_REFRESH_SECRET: keyMaterial.toString("base64")
      })
    ).toThrow("JWT_SECRET and JWT_REFRESH_SECRET must be different");
  });

  it("accepts two independently generated secrets", () => {
    const secret = createSecret();
    const refreshSecret = createSecret();
    expect(refreshSecret).not.toBe(secret);
    expect(
      createAuthConfig({
        JWT_SECRET: secret,
        JWT_REFRESH_SECRET: refreshSecret
      })
    ).toEqual({
      secret,
      expiresIn: "15m",
      refreshSecret,
      refreshExpiresIn: "7d"
    });
  });

  it("continues accepting cryptographically strong base64 secrets", () => {
    const secret = randomBytes(32).toString("base64");
    expect(requireSecret("JWT_SECRET", secret)).toBe(secret);
  });

  it("fails configuration loading before an application can start", () => {
    const secret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;

    try {
      jest.resetModules();
      // eslint-disable-next-line global-require
      expect(() => require("../../../config/auth")).toThrow("JWT_SECRET");
    } finally {
      process.env.JWT_SECRET = secret;
      process.env.JWT_REFRESH_SECRET = refreshSecret;
      jest.resetModules();
    }
  });
});
