import User from "../../models/User";

interface SetupStatus {
  needsSetup: boolean;
}

// Setup is needed while there is no user in the system yet. Once the first
// admin is created, this returns false and the install wizard locks itself.
const GetSetupStatus = async (): Promise<SetupStatus> => {
  const usersCount = await User.count();
  return { needsSetup: usersCount === 0 };
};

export default GetSetupStatus;
