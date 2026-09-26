import { ORDERING_HOURS, CANCELLATION_WINDOW_MINUTES } from "@/config/business";

/**
 * Accra is on UTC (Greenwich Mean Time) year-round with no Daylight Saving Time.
 * Therefore, Date.getUTCHours() and Date.getUTCMinutes() are identically Accra local time.
 */

export function getAccraTimeComponents(date: Date = new Date()) {
  return {
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
  };
}

/**
 * Parses "HH:mm" string to minutes from midnight
 */
function parseTimeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Same-day orders close at 10:00 AM Accra time (PRD Rule 3).
 * Any order submitted at or after 10:00 AM cannot be scheduled for same-day delivery.
 */
export function isSameDayOrderAllowed(now: Date = new Date()): boolean {
  const { hours, minutes } = getAccraTimeComponents(now);
  const currentMinutes = hours * 60 + minutes;
  const cutoffMinutes = parseTimeStringToMinutes(ORDERING_HOURS.sameDayCutoff);

  return currentMinutes < cutoffMinutes;
}

/**
 * Ordering window is 6:00 AM – 5:00 PM (17:00) Accra time.
 */
export function isWithinOrderingWindow(now: Date = new Date()): boolean {
  const { hours, minutes } = getAccraTimeComponents(now);
  const currentMinutes = hours * 60 + minutes;
  const openMinutes = parseTimeStringToMinutes(ORDERING_HOURS.opensAt);
  const closeMinutes = parseTimeStringToMinutes(ORDERING_HOURS.closesAt);

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Cancellation is allowed up to 1 hour (60 minutes) before the scheduled slot (PRD Rule 8).
 * E.g., for an 11:30 AM slot, the deadline is 10:30 AM.
 */
export function isCancellationWithinPermittedWindow(
  slotDate: Date,
  now: Date = new Date()
): boolean {
  const diffMilliseconds = slotDate.getTime() - now.getTime();
  const diffMinutes = diffMilliseconds / (1000 * 60);

  return diffMinutes >= CANCELLATION_WINDOW_MINUTES;
}
