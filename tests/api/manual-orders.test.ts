import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the admin client
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { POST } from "@/app/api/orders/manual/route";
import { createAdminClient } from "@/lib/supabase/admin";

describe("POST /api/orders/manual (Manual Order Bypass API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validManualPayload = {
    items: [
      {
        mealId: "11111111-1111-1111-1111-111111111111",
        size: "medium",
        quantity: 1,
        price: 7000,
        includedProteinPackageName: "Chicken + Egg",
      },
    ],
    customerDetails: {
      name: "Kwame Mensah",
      phone: "0241234567",
      address: "14 Boundary Road",
      area: "East Legon",
      notes: "Opposite yellow gate",
      deliverySlot: "11:30 AM",
    },
    subtotal: 7000,
    deliveryFee: 1000,
  };

  it("successfully creates a manual order and returns orderId", async () => {
    const mockOrder = { id: "order-manual-uuid-123" };
    const mockCustomer = { id: "cust-123" };
    const mockAddress = { id: "addr-123" };

    const mockSupabase: any = {
      from: vi.fn((table: string) => {
        if (table === "customers") {
          return {
            upsert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCustomer, error: null }),
              }),
            }),
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockCustomer, error: null }),
              }),
            }),
          };
        }
        if (table === "delivery_zones") {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({
                data: [{ id: "zone-1", areas: ["East Legon"], fee_pesewas: 1000 }],
                error: null,
              }),
            }),
          };
        }
        if (table === "addresses") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: mockAddress, error: null }),
              }),
            }),
          };
        }
        if (table === "orders") {
          return {
            insert: vi.fn((orderData: any) => {
              expect(orderData.payment_method).toBe("manual");
              expect(orderData.order_status).toBe("awaiting_payment");
              return {
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
                }),
              };
            }),
          };
        }
        if (table === "order_items") {
          return {
            insert: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({ data: { id: "item-1" }, error: null }),
              }),
            }),
          };
        }
        if (table === "meals" || table === "meal_sizes" || table === "protein_options") {
          return {
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
          select: vi.fn().mockResolvedValue({ data: null, error: null }),
        };
      }),
    };

    (createAdminClient as any).mockReturnValue(mockSupabase);

    const req = new Request("http://localhost/api/orders/manual", {
      method: "POST",
      body: JSON.stringify(validManualPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.orderId).toBe("order-manual-uuid-123");
  });

  it("handles errors gracefully and returns 500 with success: false", async () => {
    (createAdminClient as any).mockImplementation(() => {
      throw new Error("Database connection failure");
    });

    const req = new Request("http://localhost/api/orders/manual", {
      method: "POST",
      body: JSON.stringify(validManualPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("Database connection failure");
  });

  it("rejects ASAP orders placed outside operating hours with status 409", async () => {
    const operatingHours = await import("@/lib/operating-hours");
    const spy = vi.spyOn(operatingHours, "getAsapOperatingStatus").mockReturnValue({
      isOpen: false,
      serverTime: new Date().toISOString(),
      asapOpen: "08:00",
      asapClose: "15:00",
      reason: "ASAP orders are open 8:00 AM to 3:00 PM GMT. Please check back during operating hours or schedule for later.",
    });

    const asapPayload = {
      ...validManualPayload,
      customerDetails: {
        ...validManualPayload.customerDetails,
        deliverySlot: "ASAP (25–35 mins)",
      },
    };

    const req = new Request("http://localhost/api/orders/manual", {
      method: "POST",
      body: JSON.stringify(asapPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.message).toContain("ASAP orders are open 8:00 AM to 3:00 PM GMT");

    spy.mockRestore();
  });
});
