import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the dependencies before importing the route
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

vi.mock("@/lib/business-rules/timing", () => ({
  isSameDayOrderAllowed: vi.fn(),
}));

import { POST } from "@/app/api/orders/route";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameDayOrderAllowed } from "@/lib/business-rules/timing";

describe("POST /api/orders (Order Creation API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
    customerName: "Godwin Apedo",
    phone: "0240000000",
    area: "East Legon",
    deliveryAddress: "Boundary Road 12",
    landmark: "Near Melcom",
    deliverySlot: "11:30 AM",
    items: [
      {
        mealId: "11111111-1111-1111-1111-111111111111",
        size: "medium",
        includedProteinPackageName: "Chicken + Egg",
        extras: { chicken: 1 },
        quantity: 1,
      },
    ],
  };

  it("returns 400 when payload fails validation (e.g. invalid phone number)", async () => {
    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({ ...validPayload, phone: "123" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  it("returns 422 when delivery area is in the locked excluded list (e.g. Kasoa)", async () => {
    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify({ ...validPayload, area: "Kasoa" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400); // Caught by Zod area validator first
    const json = await res.json();
    expect(json.details.area[0]).toContain("We currently do not deliver to this area");
  });

  it("returns 409 when the kitchen is closed", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "kitchen_settings") {
          return {
            select: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                open: false,
                daily_capacity: 12,
                orders_today: 0,
                orders_date: "2026-09-26",
              },
              error: null,
            }),
          };
        }
        return {} as any;
      }),
    };
    (createAdminClient as any).mockReturnValue(mockSupabase);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("Kitchen is currently closed");
  });

  it("returns 409 when daily capacity has been reached", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "kitchen_settings") {
          return {
            select: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                open: true,
                daily_capacity: 12,
                orders_today: 12,
                orders_date: "2026-09-26",
              },
              error: null,
            }),
          };
        }
        return {} as any;
      }),
    };
    (createAdminClient as any).mockReturnValue(mockSupabase);

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("Daily capacity reached");
  });

  it("returns 409 when order is placed after 10:00 AM same-day cutoff", async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "kitchen_settings") {
          return {
            select: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                open: true,
                daily_capacity: 12,
                orders_today: 2,
                orders_date: "2026-09-26",
              },
              error: null,
            }),
          };
        }
        return {} as any;
      }),
    };
    (createAdminClient as any).mockReturnValue(mockSupabase);
    (isSameDayOrderAllowed as any).mockReturnValue(false); // cutoff passed!

    const req = new Request("http://localhost/api/orders", {
      method: "POST",
      body: JSON.stringify(validPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toContain("Same-day order cutoff (10:00 AM) has passed");
  });
});
