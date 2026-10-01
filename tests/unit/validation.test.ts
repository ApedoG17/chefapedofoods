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

  it("validates full name and rejects inputs containing digits", () => {
    expect(createOrderSchema.safeParse({ ...validOrder, customerName: "8584" }).success).toBe(false);
    expect(createOrderSchema.safeParse({ ...validOrder, customerName: "A" }).success).toBe(false);
    expect(createOrderSchema.safeParse({ ...validOrder, customerName: "Kwame123" }).success).toBe(false);
    expect(createOrderSchema.safeParse({ ...validOrder, customerName: "8584 Mensah" }).success).toBe(false);
    expect(createOrderSchema.safeParse({ ...validOrder, customerName: "Kwame Mensah" }).success).toBe(true);
    expect(createOrderSchema.safeParse({ ...validOrder, customerName: "Aba K." }).success).toBe(true);
    expect(createOrderSchema.safeParse({ ...validOrder, customerName: "Jean-Pierre" }).success).toBe(true);
  });

  it("validates phone numbers, rejects numbers above 10 digits for Ghana, and accepts international codes", () => {
    expect(createOrderSchema.safeParse({ ...validOrder, phone: "fhbfsfs" }).success).toBe(false);
    expect(createOrderSchema.safeParse({ ...validOrder, phone: "0241234567" }).success).toBe(true);
    expect(createOrderSchema.safeParse({ ...validOrder, phone: "055 987 6543" }).success).toBe(true);
    // Rejects numbers above 10 digits for Ghana
    expect(createOrderSchema.safeParse({ ...validOrder, phone: "02412345678" }).success).toBe(false);
    expect(createOrderSchema.safeParse({ ...validOrder, phone: "024 123 4567 89" }).success).toBe(false);
    // Accepts international numbers with valid country code
    expect(createOrderSchema.safeParse({ ...validOrder, phone: "+2348012345678" }).success).toBe(true);
    expect(createOrderSchema.safeParse({ ...validOrder, phone: "+12025550123" }).success).toBe(true);
  });

  it("strips HTML tags to prevent XSS injection in text fields", () => {
    const maliciousOrder = {
      ...validOrder,
      customerName: "<script>alert('xss')</script>Kwame Mensah",
      landmark: "<b>Near Melcom</b><img src=x onerror=alert(1)>",
      deliveryAddress: "<a href='evil.com'>House 12</a>, Boundary Road",
    };

    const result = createOrderSchema.safeParse(maliciousOrder);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.customerName).toBe("Kwame Mensah");
      expect(result.data.landmark).toBe("Near Melcom");
      expect(result.data.deliveryAddress).toBe("House 12, Boundary Road");
    }
  });
});
