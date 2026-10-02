/**
 * Operating Hours Configuration & Server-Time Guard for Chef Apedo Foods.
 * Timezone: Africa/Accra (Greenwich Mean Time, UTC+0, no Daylight Saving Time).
 */

export const OPERATING_TIMEZONE = "Africa/Accra" as const;

export const ASAP_HOURS = {
  open: "08:00",
  close: "15:00",
} as const;

export interface OperatingHoursStatus {
  isOpen: boolean;
  serverTime: string; // ISO string
  asapOpen: string;
  asapClose: string;
  reason?: string;
}

/**
 * Parses "HH:mm" 24-hour string into total minutes from midnight.
 */
export function parseTimeStringToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

/**
 * Formats "HH:mm" 24-hour time to friendly 12-hour string (e.g., "8:00 AM", "3:00 PM").
 */
export function formatFriendlyTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const period = (h ?? 0) >= 12 ? "PM" : "AM";
  const displayHour = (h ?? 0) % 12 === 0 ? 12 : (h ?? 0) % 12;
  const displayMin = (m ?? 0).toString().padStart(2, "0");
  return `${displayHour}:${displayMin} ${period}`;
}

/**
 * Evaluates whether ASAP on-demand cooking is active based on server time (UTC / Africa/Accra).
 * Window: 08:00 to 15:00 GMT.
 */
export function getAsapOperatingStatus(serverDate: Date = new Date()): OperatingHoursStatus {
  // Africa/Accra is UTC year-round with no DST; Date.getUTCHours() matches local Accra time
  const currentMinutes = serverDate.getUTCHours() * 60 + serverDate.getUTCMinutes();
  const openMinutes = parseTimeStringToMinutes(ASAP_HOURS.open);
  const closeMinutes = parseTimeStringToMinutes(ASAP_HOURS.close);

  const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;

  return {
    isOpen,
    serverTime: serverDate.toISOString(),
    asapOpen: ASAP_HOURS.open,
    asapClose: ASAP_HOURS.close,
    reason: isOpen
      ? undefined
      : `ASAP orders are open ${formatFriendlyTime(ASAP_HOURS.open)} to ${formatFriendlyTime(ASAP_HOURS.close)}. Please check back during operating hours or schedule for later.`,
  };
}
