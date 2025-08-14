import moment from "moment-timezone";

const DEFAULT_TIMEZONE = "America/Sao_Paulo";
const timezone = process.env.TZ || DEFAULT_TIMEZONE;

const getTimezoneOffset = (tz: string): string => {
  const momentTz = moment.tz(tz);
  const offset = momentTz.utcOffset();
  const hours = Math.floor(Math.abs(offset) / 60);
  const minutes = Math.abs(offset) % 60;
  const sign = offset >= 0 ? "+" : "-";
  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");

  return `${sign}${hoursStr}:${minutesStr}`;
};

export const TIMEZONE = timezone;
export const TIMEZONE_OFFSET = getTimezoneOffset(timezone);
export const DEFAULT_TZ = DEFAULT_TIMEZONE;
