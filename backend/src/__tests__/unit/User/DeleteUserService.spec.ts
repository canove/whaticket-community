import faker from "faker";
import AppError from "../../../errors/AppError.js";
import CreateUserService from "../../../services/UserServices/CreateUserService.js";
import DeleteUserService from "../../../services/UserServices/DeleteUserService.js";
import { disconnect, truncate } from "../../utils/database.js";

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

  it("should be delete a existing user", async () => {
    const { id } = await CreateUserService({
      name: faker.name.findName(),
      email: faker.internet.email(),
      password: faker.internet.password()
    });

    expect(DeleteUserService(id)).resolves.not.toThrow();
  });

  it("to throw an error if tries to delete a non existing user", async () => {
    expect(DeleteUserService(faker.random.number())).rejects.toBeInstanceOf(
      AppError
    );
  });
});
