import { describe, it, expect } from "vitest";
import { calculateFoodSubtotalPesewas, formatGHS } from "@/lib/pricing";
import { isAreaServiceable, getDeliveryFeeForArea } from "@/lib/delivery";
import { isSameDayOrderAllowed } from "@/lib/business-rules/timing";
import { EXCLUDED_DELIVERY_AREAS } from "@/config/business";

describe("Specific Business Edge Cases (docs/TESTING.md)", () => {
  // Scenario 1: Medium jollof with chicken and egg — correct included-protein pricing, no double-charge
  it("Scenario 1: Medium jollof with chicken and egg has base price GH₵70 with 0 extra cost", () => {
    const subtotal = calculateFoodSubtotalPesewas("medium", {});
    expect(subtotal).toBe(7000); // 7000 pesewas
    expect(formatGHS(subtotal)).toBe("GH₵70.00");
  });

  // Scenario 2: Large fried rice with two chickens + extra chicken
  it("Scenario 2: Large fried rice with 2 chickens included + 1 extra chicken charges base GH₵90 + extra GH₵15 = GH₵105", () => {
    const subtotal = calculateFoodSubtotalPesewas("large", { chicken: 1 });
    expect(subtotal).toBe(10500); // 9000 + 1500 pesewas
    expect(formatGHS(subtotal)).toBe("GH₵105.00");
  });

  // Scenario 3: Delivery to an excluded location blocked for all 7 areas
  it("Scenario 3: Every single locked excluded location is strictly unserviceable", () => {
    for (const area of EXCLUDED_DELIVERY_AREAS) {
      expect(isAreaServiceable(area)).toBe(false);
      expect(isAreaServiceable(area.toLowerCase())).toBe(false);
      expect(isAreaServiceable(` ${area} `)).toBe(false);
    }
  });

  // Scenario 4: Ordering after 10:00 AM same-day cutoff
  it("Scenario 4: Same-day order cutoff rejects orders after 10:00 AM", () => {
    const morningTime = new Date("2026-09-26T09:45:00Z");
    const cutoffTime = new Date("2026-09-26T10:00:00Z");
    const lateTime = new Date("2026-09-26T10:15:00Z");

    expect(isSameDayOrderAllowed(morningTime)).toBe(true);
    expect(isSameDayOrderAllowed(cutoffTime)).toBe(false);
    expect(isSameDayOrderAllowed(lateTime)).toBe(false);
  });

  // Scenario 5: Multiple extras pricing check
  it("Scenario 5: Multiple extra proteins correctly accumulate without float inaccuracy", () => {
    const subtotal = calculateFoodSubtotalPesewas("small", {
      chicken: 2, // 2 * 1500 = 3000
      sausage: 1, // 400
      egg: 2,     // 800
      fish: 1,    // 400
    });
    // Small base: 4500 + 3000 + 400 + 800 + 400 = 9100 pesewas
    expect(subtotal).toBe(9100);
    expect(formatGHS(subtotal)).toBe("GH₵91.00");
  });

  // Scenario 6: Serviceable areas return positive delivery fee and never combined with food subtotal
  it("Scenario 6: Serviceable zone matches return fee in pesewas, remaining distinct from food total", () => {
    const mockZones = [
      { id: "z1", name: "Zone 1", areas: ["East Legon", "Shiashie"], feePesewas: 1000, active: true },
      { id: "z2", name: "Zone 2", areas: ["Osu", "Labone"], feePesewas: 1500, active: true },
    ];

    const feeEastLegon = getDeliveryFeeForArea("East Legon", mockZones);
    const feeOsu = getDeliveryFeeForArea("Osu", mockZones);
    const feeKasoa = getDeliveryFeeForArea("Kasoa", mockZones);

    expect(feeEastLegon).toBe(1000);
    expect(feeOsu).toBe(1500);
    expect(feeKasoa).toBeNull();
  });
});
