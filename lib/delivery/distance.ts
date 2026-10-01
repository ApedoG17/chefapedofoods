/**
 * Geospatial distance calculation and dynamic tiered pricing engine.
 * Computes great-circle distances via Haversine formula from Chef Apedo's central kitchen.
 */

/**
 * Chef Apedo Central Kitchen Hub Anchor.
 * Location: South Legon Drive 6a, Accra, Ghana.
 * NOTE: These coordinates (lat: 5.6265, lng: -0.1706) are approximate and
 * should be replaced with a verified pin from Google Maps.
 */
export const CHEF_APEDO_KITCHEN = {
  name: "Chef Apedo Central Kitchen Hub",
  address: "South Legon Drive 6a, Accra, Ghana",
  lat: 5.6265,
  lng: -0.1706,
} as const;

export const BASE_COVERAGE_KM = 3.0;
export const BASE_FEE_PESEWAS = 700;       // GH₵ 7.00 base for first 3.0 km
export const PER_ADDITIONAL_KM_PESEWAS = 200; // GH₵ 2.00 per additional km
export const MAX_SERVICE_RADIUS_KM = 15.0; // Hot food delivery perimeter limit

/**
 * Calculates the great-circle distance between two GPS points using the Haversine formula.
 * @returns Distance in kilometers rounded to 1 decimal place.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const R = 6371; // Earth's mean radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10;
}

export interface DistancePricingResult {
  distanceKm: number;
  feePesewas: number;
  feeGHS: string;
  isServiceable: boolean;
  transitMinutes: number;
  breakdown: {
    baseFeePesewas: number;
    extraKm: number;
    extraFeePesewas: number;
  };
}

/**
 * Calculates dynamic delivery fee in integer pesewas based on GPS distance from the kitchen.
 * 
 * Pricing Formula:
 * - Distance <= 3.0 km: GH₵ 7.00 (700 pesewas)
 * - Distance > 3.0 km: GH₵ 7.00 + ceil(distance - 3.0) * GH₵ 2.00 (200 pesewas)
 * - Distance > 15.0 km: isServiceable = false
 */
export function calculateDistanceDeliveryFee(
  userLat: number,
  userLng: number,
  kitchenLat = CHEF_APEDO_KITCHEN.lat,
  kitchenLng = CHEF_APEDO_KITCHEN.lng
): DistancePricingResult {
  const distanceKm = calculateHaversineDistanceKm(kitchenLat, kitchenLng, userLat, userLng);
  const isServiceable = distanceKm <= MAX_SERVICE_RADIUS_KM;

  let extraKm = 0;
  let extraFeePesewas = 0;

  if (distanceKm > BASE_COVERAGE_KM) {
    extraKm = Math.ceil(distanceKm - BASE_COVERAGE_KM);
    extraFeePesewas = extraKm * PER_ADDITIONAL_KM_PESEWAS;
  }

  const feePesewas = BASE_FEE_PESEWAS + extraFeePesewas;
  // Estimate transit time: ~3 mins per km, with a 10 min minimum for nearby campus drops
  const transitMinutes = Math.max(10, Math.round(distanceKm * 3));

  return {
    distanceKm,
    feePesewas,
    feeGHS: (feePesewas / 100).toFixed(2),
    isServiceable,
    transitMinutes,
    breakdown: {
      baseFeePesewas: BASE_FEE_PESEWAS,
      extraKm,
      extraFeePesewas,
    },
  };
}
