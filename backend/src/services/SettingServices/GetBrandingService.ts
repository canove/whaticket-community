import Setting from "../../models/Setting";

export interface Branding {
  appName: string;
  primaryColor: string;
  secondaryColor: string;
}

const DEFAULTS: Branding = {
  appName: "WhaTicket",
  primaryColor: "#0E7C6B",
  secondaryColor: "#25D366"
};

// Public branding (app name + colors) used by the theme and the header.
// Falls back to defaults when the settings haven't been customized yet.
const GetBrandingService = async (): Promise<Branding> => {
  const settings = await Setting.findAll({
    where: { key: ["appName", "primaryColor", "secondaryColor"] }
  });

  const values = new Map(settings.map(s => [s.key, s.value]));

  return {
    appName: values.get("appName") || DEFAULTS.appName,
    primaryColor: values.get("primaryColor") || DEFAULTS.primaryColor,
    secondaryColor: values.get("secondaryColor") || DEFAULTS.secondaryColor
  };
};

export default GetBrandingService;
