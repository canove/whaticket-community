import { v4 as uuidv4 } from "uuid";

import AppError from "../../errors/AppError";
import User from "../../models/User";
import Setting from "../../models/Setting";
import CreateUserService from "../UserServices/CreateUserService";

interface Request {
  name: string;
  email: string;
  password: string;
}

interface SetupResult {
  id: number;
  name: string;
  email: string;
  profile: string;
}

const ensureSetting = async (key: string, value: string): Promise<void> => {
  const existing = await Setting.findOne({ where: { key } });
  if (!existing) {
    await Setting.create({ key, value });
  }
};

// First-run install wizard: creates the default settings + the first admin user.
// Guarded server-side — it only runs while NO user exists, so it can never be
// used to create a second admin or overwrite an existing install.
const CreateInitialSetup = async ({
  name,
  email,
  password
}: Request): Promise<SetupResult> => {
  const usersCount = await User.count();
  if (usersCount > 0) {
    throw new AppError("Setup already completed", 403);
  }

  // Default settings (mirrors the seeds) so the Settings page and signup work.
  await ensureSetting("userCreation", "enabled");
  await ensureSetting("userApiToken", uuidv4());

  // CreateUserService validates name/email/password and hashes the password.
  const user = await CreateUserService({
    name,
    email,
    password,
    profile: "admin"
  });

  return user;
};

export default CreateInitialSetup;
