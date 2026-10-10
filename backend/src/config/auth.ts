import requireSecret, { getSecretBytes } from "./requireSecret";

export const createAuthConfig = (env: NodeJS.ProcessEnv = process.env) => {
  const secret = requireSecret("JWT_SECRET", env.JWT_SECRET);
  const refreshSecret = requireSecret(
    "JWT_REFRESH_SECRET",
    env.JWT_REFRESH_SECRET
  );

  if (
    getSecretBytes("JWT_SECRET", secret).equals(
      getSecretBytes("JWT_REFRESH_SECRET", refreshSecret)
    )
  ) {
    throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be different");
  }

  return {
    secret,
    expiresIn: "15m",
    refreshSecret,
    refreshExpiresIn: "7d"
  };
};

export default createAuthConfig();
