import Setting from "../../models/Setting";

interface Request {
  appName?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

const upsertSetting = async (key: string, value: string): Promise<void> => {
  const existing = await Setting.findOne({ where: { key } });
  if (existing) {
    await existing.update({ value });
  } else {
    await Setting.create({ key, value });
  }
};

// Upserts the branding settings (so it works whether or not they exist yet).
const UpdateBrandingService = async ({
  appName,
  primaryColor,
  secondaryColor
}: Request): Promise<void> => {
  if (typeof appName === "string") {
    await upsertSetting("appName", appName.trim());
  }
  if (typeof primaryColor === "string") {
    await upsertSetting("primaryColor", primaryColor.trim());
  }
  if (typeof secondaryColor === "string") {
    await upsertSetting("secondaryColor", secondaryColor.trim());
  }
};

export default UpdateBrandingService;
