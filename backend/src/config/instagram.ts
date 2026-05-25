import { logger } from "../utils/logger.js";

const GRAPH_API_VERSION = "v23.0";

const instagramConfig = {
  appId: process.env.IG_APP_ID || "",
  appSecret: process.env.IG_APP_SECRET || "",
  webhookVerifyToken:
    process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "whaticket_ig_verify",
  graphApiVersion: GRAPH_API_VERSION,
  graphBaseUrl: `https://graph.instagram.com/${GRAPH_API_VERSION}`,
  graphRootUrl: "https://graph.instagram.com",
  apiBaseUrl: "https://api.instagram.com",
  authorizeUrl: "https://www.instagram.com/oauth/authorize"
};

if (!instagramConfig.appId || !instagramConfig.appSecret) {
  logger.warn({
    info: "Instagram: IG_APP_ID/IG_APP_SECRET não configurados — OAuth indisponível"
  });
}

if (
  process.env.NODE_ENV === "production" &&
  instagramConfig.webhookVerifyToken === "whaticket_ig_verify"
) {
  logger.warn({
    info: "Instagram: INSTAGRAM_WEBHOOK_VERIFY_TOKEN usando default — defina um token forte em produção"
  });
}

export default instagramConfig;
