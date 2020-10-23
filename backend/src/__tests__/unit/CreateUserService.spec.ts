import { disconnect, truncate } from "../utils/database";
// import User from "../../models/User";
// import app from "../../app";
import CreateUserService from "../../services/UserServices/CreateUserService";
import AppError from "../../errors/AppError";

describe("User", () => {
  beforeEach(async () => {
    await truncate();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("should be able to create a new user", async () => {
    const user = await CreateUserService({
      name: "dasdas",
      email: "tesssst@test.com",
      password: "passwo22221131rd"
    });

    expect(user).toHaveProperty("id");
  });

  it("should not be able to create a user with duplicated email", async () => {
    await CreateUserService({
      name: "dasdas",
      email: "tesssst@test.com",
      password: "passwo22221131rd"
    });

    expect(
      CreateUserService({
        name: "dasdas",
        email: "tesssst@test.com",
        password: "passwo22221131rd"
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
