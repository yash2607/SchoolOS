import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime.js";
import timezonePlugin from "dayjs/plugin/timezone.js";
import utcPlugin from "dayjs/plugin/utc.js";
import isToday_ from "dayjs/plugin/isToday.js";

dayjs.extend(relativeTimePlugin);
dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);
dayjs.extend(isToday_);

export function formatDate(date: Date | string): string {
  return dayjs(date).format("DD MMM YYYY");
}

export function formatTime(date: Date | string): string {
  return dayjs(date).format("hh:mm A");
}

export function formatDateTime(date: Date | string): string {
  return dayjs(date).format("DD MMM YYYY, hh:mm A");
}

export function relativeTime(date: Date | string): string {
  return dayjs(date).fromNow();
}

export function isToday(date: Date | string): boolean {
  return dayjs(date).isToday();
}

export function formatForDisplay(date: Date, timezone: string): string {
  return dayjs(date).tz(timezone).format("DD MMM YYYY, hh:mm A");
}

export function toISODate(date: Date | string): string {
  return dayjs(date).format("YYYY-MM-DD");
}

export function diffInDays(from: Date | string, to: Date | string): number {
  return dayjs(to).diff(dayjs(from), "day");
}
