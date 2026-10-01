import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the admin client
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { POST as initHubtelPOST } from "@/app/api/payments/hubtel/route";
import { POST as webhookHubtelPOST } from "@/app/api/webhooks/hubtel/route";
import { createAdminClient } from "@/lib/supabase/admin";

describe("Hubtel Payment System Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validPayload = {
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

  describe("POST /api/payments/hubtel (Initiate Payment)", () => {
    it("successfully creates awaiting_payment order and returns checkoutUrl when Hubtel succeeds", async () => {
      const mockOrder = { id: "hubtel-order-123" };
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
                expect(orderData.payment_method).toBe("hubtel");
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

      // Mock global fetch for Hubtel initiate endpoint
      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          responseCode: "0000",
          data: {
            checkoutUrl: "https://payproxyapi.hubtel.com/checkout/pay-12345",
          },
        }),
      } as any);

      try {
        const req = new Request("http://localhost/api/payments/hubtel", {
          method: "POST",
          body: JSON.stringify(validPayload),
        });

        const res = await initHubtelPOST(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.success).toBe(true);
        expect(json.orderId).toBe("hubtel-order-123");
        expect(json.checkoutUrl).toBe("https://payproxyapi.hubtel.com/checkout/pay-12345");
      } finally {
        global.fetch = originalFetch;
      }
    });

    it("returns 502 when Hubtel API responds with non-0000 code (e.g. placeholder keys)", async () => {
      const mockOrder = { id: "hubtel-order-456" };
      const mockCustomer = { id: "cust-456" };
      const mockAddress = { id: "addr-456" };

      const mockSupabase: any = {
        from: vi.fn((table: string) => {
          if (table === "customers") {
            return {
              upsert: vi.fn().mockReturnValue({
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
              insert: vi.fn().mockReturnValue({
                select: vi.fn().mockReturnValue({
                  single: vi.fn().mockResolvedValue({ data: mockOrder, error: null }),
                }),
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
          return {
            insert: vi.fn().mockResolvedValue({ error: null }),
            select: vi.fn().mockResolvedValue({ data: [], error: null }),
          };
        }),
      };

      (createAdminClient as any).mockReturnValue(mockSupabase);

      const originalFetch = global.fetch;
      global.fetch = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({
          responseCode: "4001",
          message: "Invalid merchant credentials",
        }),
      } as any);

      try {
        const req = new Request("http://localhost/api/payments/hubtel", {
          method: "POST",
          body: JSON.stringify(validPayload),
        });

        const res = await initHubtelPOST(req);
        expect(res.status).toBe(502);
        const json = await res.json();
        expect(json.success).toBe(false);
        expect(json.message).toContain("Invalid merchant credentials");
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe("POST /api/webhooks/hubtel (Webhook Listener)", () => {
    it("confirms order and marks payment as paid on responseCode 0000", async () => {
      const existingOrder = {
        id: "order-hubtel-confirmed-1",
        order_status: "awaiting_payment",
        payment_status: "unpaid",
        subtotal_pesewas: 7000,
      };

      const mockSupabase: any = {
        from: vi.fn((table: string) => {
          expect(table).toBe("orders");
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                single: vi.fn().mockResolvedValue({
                  data: existingOrder,
                  error: null,
                }),
              }),
            }),
            update: vi.fn((updateData: any) => {
              expect(updateData.order_status).toBe("confirmed");
              expect(updateData.payment_status).toBe("paid");
              return {
                eq: vi.fn((field: string, val: string) => {
                  expect(field).toBe("id");
                  expect(val).toBe("order-hubtel-confirmed-1");
                  return {
                    select: vi.fn().mockReturnValue({
                      single: vi.fn().mockResolvedValue({
                        data: {
                          id: val,
                          order_status: "confirmed",
                          payment_status: "paid",
                        },
                        error: null,
                      }),
                    }),
                  };
                }),
              };
            }),
          };
        }),
      };

      (createAdminClient as any).mockReturnValue(mockSupabase);

      const webhookBody = {
        Data: {
          clientReference: "order-hubtel-confirmed-1",
          responseCode: "0000",
          status: "Success",
          amount: 70.0,
        },
      };

      const req = new Request("http://localhost/api/webhooks/hubtel", {
        method: "POST",
        body: JSON.stringify(webhookBody),
      });

      const res = await webhookHubtelPOST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toBe("Order confirmed successfully");
      expect(json.orderId).toBe("order-hubtel-confirmed-1");
    });

    it("rejects webhook if clientReference is missing", async () => {
      const req = new Request("http://localhost/api/webhooks/hubtel", {
        method: "POST",
        body: JSON.stringify({ Data: { responseCode: "0000" } }),
      });

      const res = await webhookHubtelPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.message).toContain("Missing clientReference");
    });

    it("returns 400 when payment status is not successful", async () => {
      const webhookBody = {
        Data: {
          clientReference: "order-failed-1",
          responseCode: "4100",
          status: "Failed",
        },
      };

      const req = new Request("http://localhost/api/webhooks/hubtel", {
        method: "POST",
        body: JSON.stringify(webhookBody),
      });

      const res = await webhookHubtelPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.message).toBe("Payment not successful or pending");
    });
  });
});
