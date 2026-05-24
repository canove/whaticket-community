/* eslint-disable no-undef */
export const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
export const GIT_SHA =
  typeof __GIT_SHA__ !== "undefined" ? __GIT_SHA__ : "local";
export const BUILD_DATE =
  typeof __BUILD_DATE__ !== "undefined" ? __BUILD_DATE__ : null;

export const formatBuildDate = () => {
  if (!BUILD_DATE) return "";
  return new Date(BUILD_DATE).toISOString().replace("T", " ").slice(0, 16) + " UTC";
};
