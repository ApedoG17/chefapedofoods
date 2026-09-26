/**
 * Locked business constants — mirrors docs/PRD.md.
 * Per RULES.md: business rules live in one place. Don't duplicate these
 * numbers elsewhere; import from here.
 */

export const ORDERING_HOURS = {
  opensAt: "06:00",
  closesAt: "17:00",
  sameDayCutoff: "10:00",
  firstDeliverySlot: "11:30",
} as const;

export const CANCELLATION_WINDOW_MINUTES = 60;

/** Starting operational ceiling, not permanent — see docs/TASKS.md §0. */
export const DAILY_ORDER_CAPACITY_DEFAULT = 12;

/** GH₵ amounts are stored/handled as integer pesewas — see RULES.md. */
export const MEAL_SIZES = {
  small: { label: "Small", basePesewas: 4500 },
  medium: { label: "Medium", basePesewas: 7000 },
  large: { label: "Large", basePesewas: 9000 },
} as const;

export const INCLUDED_PROTEIN_OPTIONS: Record<keyof typeof MEAL_SIZES, string[]> = {
  small: ["2 Sausages", "2 Eggs"],
  medium: ["Chicken + Egg", "Chicken + Sausage"],
  large: [
    "Chicken + 2 Sausages",
    "Chicken + 2 Eggs",
    "Chicken + Sausage + Egg",
    "2 Chickens",
  ],
};

export const EXTRA_PROTEIN_PESEWAS = {
  chicken: 1500,
  sausage: 400,
  egg: 400,
  fish: 400,
} as const;

/** GH₵10 is the only locked delivery-fee figure — real per-zone fees are
 * still open (docs/PRD.md §28 in the planning doc). Never hard-code a
 * per-zone number here; read it from the DeliveryZone table. */
export const DELIVERY_FEE_STARTING_PESEWAS = 1000;

export const EXCLUDED_DELIVERY_AREAS = [
  "Kasoa",
  "Teshie",
  "Nungua",
  "Ashaiman",
  "Chorkor",
  "Mamprobi",
  "Abokobi",
] as const;

export const ORDER_STATUSES = [
  "awaiting_payment",
  "confirmed",
  "preparing",
  "ready_for_dispatch",
  "dispatched",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
