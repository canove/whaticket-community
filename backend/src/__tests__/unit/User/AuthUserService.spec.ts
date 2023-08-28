import faker from "faker";
import AppError from "../../../errors/AppError";
import AuthUserService from "../../../services/UserServices/AuthUserService";
import CreateUserService from "../../../services/UserServices/CreateUserService";
import { disconnect, truncate } from "../../utils/database";
import CreateCompanyService from "../../../services/CompanyService/CreateCompanyService";

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
    const password = faker.internet.password();
    const email = faker.internet.email();

   const extractedCompany = await createCompany();

   const company = extractedCompany.toString();
   const companyIds: number[] = [extractedCompany];

    await CreateUserService({
      name: faker.name.findName(),
      email,
      password,
      companyIds
    });

    const response = await AuthUserService({
      email,
      password,
      company
    });


    expect(response).toHaveProperty("token");
  });

  it("should not be able to login with not registered email", async () => {
    try {
      const extractedCompany = await createCompany();

      await AuthUserService({
        email: faker.internet.email(),
        password: faker.internet.password(),
        company: extractedCompany.toString()
      });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe("ERR_INVALID_CREDENTIALS");
    }
  });

  it("should not be able to login with incorret password", async () => {

    const extractedCompany = await createCompany();
    const companyIds: number[] = [extractedCompany];
    
    await CreateUserService({
      name: faker.name.findName(),
      email: "mail@test.com",
      password: faker.internet.password(),
      companyIds: companyIds
    });

    try {
      await AuthUserService({
        email: "mail@test.com",
        password: faker.internet.password(),
        company: '1'
      });
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect(err.statusCode).toBe(401);
      expect(err.message).toBe("ERR_INVALID_CREDENTIALS");
    }
  });

});

async function createCompany() {
  const createdCompany = await CreateCompanyService({
    name: "Whaticket Company 1"
  });

  const extractedCompany = createdCompany.company?.id;
  if (extractedCompany == undefined) {
    throw new Error("Company ID is undefined.");
  }
  return extractedCompany;
}

