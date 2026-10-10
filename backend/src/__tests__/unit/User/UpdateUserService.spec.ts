import faker from "faker";
import AppError from "../../../errors/AppError";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import UpdateUserService from "../../../services/UserServices/UpdateUserService";
import ShowUserService from "../../../services/UserServices/ShowUserService";
import { disconnect, truncate } from "../../utils/database";

describe("User", () => {
  beforeEach(async () => {
    await truncate();
  });

  afterEach(async () => {
    await truncate();
  });

  afterAll(async () => {
    await disconnect();
  });

  it("should be able to find a user", async () => {
    const newUser = await CreateUserService({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    });

    const updatedUser = await UpdateUserService({
      userId: newUser.id,
      userData: {
        name: "New name",
        email: "newmail@email.com"
      }
    });

    expect(updatedUser).toHaveProperty("name", "New name");
    expect(updatedUser).toHaveProperty("email", "newmail@email.com");
  });

  it("revokes existing refresh tokens when the password changes", async () => {
    const newUser = await CreateUserService({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    });
    const userBeforeUpdate = await ShowUserService(newUser.id);

    await UpdateUserService({
      userId: newUser.id,
      userData: { password: "new-synthetic-password" }
    });

    const userAfterUpdate = await ShowUserService(newUser.id);
    expect(userAfterUpdate.tokenVersion).toBe(
      userBeforeUpdate.tokenVersion + 1
    );
  });

  it("should not be able to updated a inexisting user", async () => {
    const userId = faker.random.number();
    const userData = {
      name: faker.name.findName(),
      email: faker.internet.email()
    };

    expect(UpdateUserService({ userId, userData })).rejects.toBeInstanceOf(
      AppError
    );
  });

  it("should not be able to updated an user with invalid data", async () => {
    const newUser = await CreateUserService({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    });

    const userId = newUser.id;
    const userData = {
      name: faker.name.findName(),
      email: "test.worgn.email"
    };

    expect(UpdateUserService({ userId, userData })).rejects.toBeInstanceOf(
      AppError
    );
  });
});
