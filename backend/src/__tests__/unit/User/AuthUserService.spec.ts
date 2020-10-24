import faker from "faker";
import AppError from "../../../errors/AppError";
import AuthUserService from "../../../services/UserServices/AuthUserSerice";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import { disconnect, truncate } from "../../utils/database";

describe("Auth", () => {
  beforeEach(async () => {
    await truncate();
  });

  afterEach(async () => {
    await truncate();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("should be able to login with an existing user", async () => {
    await CreateUserService({
      name: faker.name.findName(),
      email: "mail@test.com",
      password: "hardpassword"
    });

    const response = await AuthUserService({
      email: "mail@test.com",
      password: "hardpassword"
    });

    expect(response).toHaveProperty("token");
  });

  it("should not be able to login with not registered email", async () => {
    try {
      await AuthUserService({
        email: faker.internet.email(),
        password: faker.internet.password()
      });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe("ERR_INVALID_CREDENTIALS");
    }
  });

  it("should not be able to login with incorret password", async () => {
    await CreateUserService({
      name: faker.name.findName(),
      email: "mail@test.com",
      password: "hardpassword"
    });

    try {
      await AuthUserService({
        email: "mail@test.com",
        password: faker.internet.password()
      });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe("ERR_INVALID_CREDENTIALS");
    }
  });
});
