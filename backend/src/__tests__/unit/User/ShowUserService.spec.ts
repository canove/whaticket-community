import faker from "faker";
import AppError from "../../../errors/AppError";
import User from "../../../models/User";
import CreateUserService from "../../../services/UserServices/CreateUserService";
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

    const user = await ShowUserService(newUser.id);

    expect(user).toHaveProperty("id");
    expect(user).toBeInstanceOf(User);
  });

  it("should not be able to find a inexisting user", async () => {
    expect(ShowUserService(faker.random.number())).rejects.toBeInstanceOf(
      AppError
    );
  });
});
