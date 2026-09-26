import { EXCLUDED_DELIVERY_AREAS } from "@/config/business";

export function isAreaServiceable(area: string): boolean {
  if (!area || typeof area !== "string") return false;
  const normalized = area.trim().toLowerCase();
  return !EXCLUDED_DELIVERY_AREAS.some(
    (excluded) => excluded.toLowerCase() === normalized
  );
}

export interface DeliveryZoneLike {
  id: string;
  name: string;
  areas: string[];
  fee_pesewas?: number;
  feePesewas?: number;
  active: boolean;
}

/**
 * Matches an area against active delivery zones.
 * Never returns a client-chosen or hard-coded per-zone number.
 * Returns fee in pesewas, or null if the area is not covered or excluded.
 */
export function getDeliveryFeeForArea(
  area: string,
  zones: DeliveryZoneLike[]
): number | null {
  if (!isAreaServiceable(area)) {
    return null;
  }

  const normalizedArea = area.trim().toLowerCase();

  for (const zone of zones) {
    if (!zone.active) continue;
    const matches = zone.areas.some(
      (a) => a.trim().toLowerCase() === normalizedArea
    );
    if (matches) {
      const fee = zone.fee_pesewas ?? zone.feePesewas;
      return typeof fee === "number" ? fee : null;
    }
  }

  return null;
}
