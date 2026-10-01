import { getAccraTimeComponents } from "@/lib/business-rules/timing";
import { CHEF_APEDO_KITCHEN, calculateHaversineDistanceKm } from "@/lib/delivery/distance";
export { CHEF_APEDO_KITCHEN };

/**
 * Standard campus & metro transit duration estimates in minutes.
 */
export const ZONE_TRANSIT_MINUTES: Record<string, number> = {
  "evandy hostel": 10,
  "pentagon": 10,
  "pentagon hostel": 10,
  "main campus": 12,
  "legon campus": 12,
  "balme library": 12,
  "night market": 12,
  "commonwealth": 12,
  "sarbah": 12,
  "akuafo": 12,
  "volta": 12,
  "east legon": 18,
  "shiashie": 18,
  "bawaleshie": 18,
  "airport residential": 20,
  "airport": 20,
  "osu": 25,
  "cantonments": 25,
  "labone": 25,
  "spintex": 30,
  "batsonaa": 30,
};

export const KITCHEN_BASE_PREP_MINUTES = 20;

/**
 * Resolves transit minutes for a given campus or municipal area.
 */
export function getZoneTransitMinutes(area: string): number {
  if (!area) return 15;
  const normalized = area.trim().toLowerCase();
  for (const [key, minutes] of Object.entries(ZONE_TRANSIT_MINUTES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return minutes;
    }
  }
  return 15;
}

export interface ZoneETAResult {
  transitMinutes: number;
  prepMinutes: number;
  minTotalMinutes: number;
  maxTotalMinutes: number;
  etaWindow: string; // e.g. "12:45 PM – 1:00 PM"
  etaRange: string;  // e.g. "30–40 mins"
  slotDescriptor: string; // e.g. "ASAP (30–40 mins)"
}

/**
 * Calculates dynamic ASAP delivery arrival window combining kitchen prep + zone transit.
 */
export function calculateZoneETA(
  area: string,
  prepMinutes: number = KITCHEN_BASE_PREP_MINUTES,
  now: Date = new Date()
): ZoneETAResult {
  const transitMinutes = getZoneTransitMinutes(area);
  const minTotalMinutes = prepMinutes + transitMinutes;
  const maxTotalMinutes = minTotalMinutes + 10;

  const minDate = new Date(now.getTime() + minTotalMinutes * 60 * 1000);
  const maxDate = new Date(now.getTime() + maxTotalMinutes * 60 * 1000);

  const formatTime = (d: Date) => {
    // Format UTC hours/minutes because Accra is identically UTC/GMT year-round
    const { hours, minutes } = getAccraTimeComponents(d);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  const etaWindow = `${formatTime(minDate)} – ${formatTime(maxDate)}`;
  const etaRange = `${minTotalMinutes}–${maxTotalMinutes} mins`;
  const slotDescriptor = `ASAP (${etaRange})`;

  return {
    transitMinutes,
    prepMinutes,
    minTotalMinutes,
    maxTotalMinutes,
    etaWindow,
    etaRange,
    slotDescriptor,
  };
}

/**
 * Calculates dynamic ASAP delivery arrival window combining kitchen prep + distance-based transit.
 * Transit duration: ~3 mins/km with a 10-minute floor.
 */
export function calculateDistanceETA(
  distanceKm: number,
  prepMinutes: number = KITCHEN_BASE_PREP_MINUTES,
  now: Date = new Date()
): ZoneETAResult {
  const transitMinutes = Math.max(10, Math.round(distanceKm * 3));
  const minTotalMinutes = prepMinutes + transitMinutes;
  const maxTotalMinutes = minTotalMinutes + 10;

  const minDate = new Date(now.getTime() + minTotalMinutes * 60 * 1000);
  const maxDate = new Date(now.getTime() + maxTotalMinutes * 60 * 1000);

  const formatTime = (d: Date) => {
    const { hours, minutes } = getAccraTimeComponents(d);
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  const etaWindow = `${formatTime(minDate)} – ${formatTime(maxDate)}`;
  const etaRange = `${minTotalMinutes}–${maxTotalMinutes} mins`;
  const slotDescriptor = `ASAP (${etaRange})`;

  return {
    transitMinutes,
    prepMinutes,
    minTotalMinutes,
    maxTotalMinutes,
    etaWindow,
    etaRange,
    slotDescriptor,
  };
}

/**
 * Calculates dynamic ASAP delivery arrival window directly from destination GPS coordinates,
 * measured against the central kitchen anchor at South Legon Drive 6a.
 */
export function calculateCoordinateETA(
  destLat: number,
  destLng: number,
  prepMinutes: number = KITCHEN_BASE_PREP_MINUTES,
  now: Date = new Date()
): ZoneETAResult {
  const distanceKm = calculateHaversineDistanceKm(
    CHEF_APEDO_KITCHEN.lat,
    CHEF_APEDO_KITCHEN.lng,
    destLat,
    destLng
  );
  return calculateDistanceETA(distanceKm, prepMinutes, now);
}

export interface ScheduledDeliverySlot {
  id: string;
  label: string;
  hours: number;
  minutes: number;
  available: boolean;
  reason?: string;
}

/**
 * Master schedule of 30-minute campus delivery slots from 11:30 AM to 4:30 PM GMT.
 */
export const MASTER_DELIVERY_SLOTS = [
  { id: "11:30", label: "11:30 AM", hours: 11, minutes: 30 },
  { id: "12:00", label: "12:00 PM", hours: 12, minutes: 0 },
  { id: "12:30", label: "12:30 PM", hours: 12, minutes: 30 },
  { id: "13:00", label: "1:00 PM", hours: 13, minutes: 0 },
  { id: "13:30", label: "1:30 PM", hours: 13, minutes: 30 },
  { id: "14:00", label: "2:00 PM", hours: 14, minutes: 0 },
  { id: "14:30", label: "2:30 PM", hours: 14, minutes: 30 },
  { id: "15:00", label: "3:00 PM", hours: 15, minutes: 0 },
  { id: "15:30", label: "3:30 PM", hours: 15, minutes: 30 },
  { id: "16:00", label: "4:00 PM", hours: 16, minutes: 0 },
  { id: "16:30", label: "4:30 PM", hours: 16, minutes: 30 },
];

/**
 * Time Guard: Strictly filters delivery slots against Date.now() in Accra local time (GMT).
 * Disables past slots and slots too close to current time to guarantee fresh preparation.
 */
export function getAvailableDeliverySlots(
  now: Date = new Date(),
  prepBufferMinutes: number = KITCHEN_BASE_PREP_MINUTES
): ScheduledDeliverySlot[] {
  const { hours: currentHours, minutes: currentMinutes } = getAccraTimeComponents(now);
  const currentTotalMinutes = currentHours * 60 + currentMinutes;

  return MASTER_DELIVERY_SLOTS.map((slot) => {
    const slotTotalMinutes = slot.hours * 60 + slot.minutes;
    // Slot must be at least prepBufferMinutes in the future
    const isPastOrTooSoon = slotTotalMinutes <= currentTotalMinutes + prepBufferMinutes;

    return {
      ...slot,
      available: !isPastOrTooSoon,
      reason: isPastOrTooSoon ? "Time slot has passed or is too soon to prep" : undefined,
    };
  });
}
