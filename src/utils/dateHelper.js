import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

const TIMEZONE = "Asia/Jakarta";

export function formatToWIB(date, format = "YYYY-MM-DD HH:mm:ss") {
  return date ? dayjs(date).tz(TIMEZONE).format(format) : null;
}
