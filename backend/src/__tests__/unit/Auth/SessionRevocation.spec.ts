import { Request, Response } from "express";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import ShowUserService from "../../../services/UserServices/ShowUserService";
import { createRefreshToken } from "../../../helpers/CreateTokens";
import { remove } from "../../../controllers/SessionController";
import { RefreshTokenService } from "../../../services/AuthServices/RefreshTokenService";
import { disconnect, truncate } from "../../utils/database";

describe("refresh-token revocation", () => {
  beforeEach(async () => {
    await truncate();
  });

  afterEach(async () => {
    await truncate();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("logout invalidates previously issued refresh tokens", async () => {
    const createdUser = await CreateUserService({
      name: "Synthetic session user",
      email: "session-revocation@example.com",
      password: "synthetic-password"
    });
    const user = await ShowUserService(createdUser.id);
    const oldRefreshToken = createRefreshToken(user);
    const req = {
      user: { id: String(user.id), profile: user.profile }
    } as Request;
    const res = {
      clearCookie: jest.fn(),
      send: jest.fn().mockReturnThis()
    } as unknown as Response;

    await remove(req, res);

    expect(res.clearCookie).toHaveBeenCalledWith("jrt");
    await expect(
      RefreshTokenService(
        { clearCookie: jest.fn() } as unknown as Response,
        oldRefreshToken
      )
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
