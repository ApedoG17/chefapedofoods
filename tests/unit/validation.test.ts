import { describe, it, expect } from "vitest";
import { createOrderSchema } from "@/lib/validation/orders";

describe("Order Validation Schemas (lib/validation/orders)", () => {
  const validOrder = {
    customerName: "Godwin Apedo",
    phone: "0240000000",
    area: "East Legon",
    deliveryAddress: "House 12, Boundary Road",
    landmark: "Near Melcom",
    deliverySlot: "11:30 AM",
    items: [
      {
        mealId: "11111111-1111-1111-1111-111111111111",
        size: "medium" as const,
        includedProteinPackageName: "Chicken + Egg",
        extras: { chicken: 1 },
        quantity: 1,
      },
    ],
  };

  it("passes validation for a valid Golden Path order payload", () => {
    const result = createOrderSchema.safeParse(validOrder);
    expect(result.success).toBe(true);
  });

  it("accepts Ghana phone numbers with spaces or international code (+233)", () => {
    expect(
      createOrderSchema.safeParse({ ...validOrder, phone: "024 123 4567" }).success
    ).toBe(true);
    expect(
      createOrderSchema.safeParse({ ...validOrder, phone: "+233241234567" }).success
    ).toBe(true);
  });

  it("rejects invalid phone numbers", () => {
    expect(
      createOrderSchema.safeParse({ ...validOrder, phone: "12345" }).success
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({ ...validOrder, phone: "0881234567" }).success
    ).toBe(false);
  });

  it("rejects orders to excluded delivery areas (e.g. Kasoa)", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      area: "Kasoa",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        "We currently do not deliver to this area"
      );
    }
  });

  it("rejects empty cart / empty items array", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid meal size", () => {
    const result = createOrderSchema.safeParse({
      ...validOrder,
      items: [
        {
          ...validOrder.items[0],
          size: "extra-large",
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
