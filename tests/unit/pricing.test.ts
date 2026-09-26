import { describe, it, expect } from "vitest";
import {
  calculateFoodSubtotalPesewas,
  pesewasToCedis,
  formatGHS,
} from "@/lib/pricing";

describe("Pricing Calculations (lib/pricing)", () => {
  it("calculates base price for Small size without extras (GH₵45 = 4500 pesewas)", () => {
    const subtotal = calculateFoodSubtotalPesewas("small");
    expect(subtotal).toBe(4500);
    expect(pesewasToCedis(subtotal)).toBe("45.00");
    expect(formatGHS(subtotal)).toBe("GH₵45.00");
  });

  it("calculates base price for Medium size without extras (GH₵70 = 7000 pesewas)", () => {
    const subtotal = calculateFoodSubtotalPesewas("medium");
    expect(subtotal).toBe(7000);
    expect(pesewasToCedis(subtotal)).toBe("70.00");
    expect(formatGHS(subtotal)).toBe("GH₵70.00");
  });

  it("calculates base price for Large size without extras (GH₵90 = 9000 pesewas)", () => {
    const subtotal = calculateFoodSubtotalPesewas("large");
    expect(subtotal).toBe(9000);
    expect(pesewasToCedis(subtotal)).toBe("90.00");
    expect(formatGHS(subtotal)).toBe("GH₵90.00");
  });

  it("Golden Path: Medium size + 1 extra chicken (+GH₵15) = GH₵85 (8500 pesewas)", () => {
    const subtotal = calculateFoodSubtotalPesewas("medium", { chicken: 1 });
    expect(subtotal).toBe(8500);
    expect(formatGHS(subtotal)).toBe("GH₵85.00");
  });

  it("Edge Case 2: Large size + 1 extra chicken (+GH₵15) + 1 extra egg (+GH₵4) = GH₵109 (10900 pesewas)", () => {
    const subtotal = calculateFoodSubtotalPesewas("large", { chicken: 1, egg: 1 });
    expect(subtotal).toBe(10900);
    expect(formatGHS(subtotal)).toBe("GH₵109.00");
  });

  it("ignores zero or negative extras quantities", () => {
    const subtotal = calculateFoodSubtotalPesewas("small", { chicken: 0, sausage: -1 });
    expect(subtotal).toBe(4500);
  });
});
