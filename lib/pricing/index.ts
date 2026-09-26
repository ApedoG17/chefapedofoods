import { MEAL_SIZES, EXTRA_PROTEIN_PESEWAS } from "@/config/business";

type SizeKey = keyof typeof MEAL_SIZES;
type ExtraKey = keyof typeof EXTRA_PROTEIN_PESEWAS;

export interface SelectedExtras {
  chicken?: number;
  sausage?: number;
  egg?: number;
  fish?: number;
}

/**
 * Server-side price calculation — the client never sends a trusted total.
 * Mirrors the Meal → MealSize → ProteinPackage → PackageItem chain in
 * docs/ARCHITECTURE.md. Always returns integer pesewas.
 */
export function calculateFoodSubtotalPesewas(
  size: SizeKey,
  extras: SelectedExtras = {}
): number {
  let total: number = MEAL_SIZES[size].basePesewas;

  (Object.keys(extras) as ExtraKey[]).forEach((key) => {
    const qty = extras[key] ?? 0;
    if (qty > 0) {
      total += EXTRA_PROTEIN_PESEWAS[key] * qty;
    }
  });

  return total;
}

export function pesewasToCedis(pesewas: number): string {
  return (pesewas / 100).toFixed(2);
}

export function formatGHS(pesewas: number): string {
  return `GH₵${pesewasToCedis(pesewas)}`;
}
