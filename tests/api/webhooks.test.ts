import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { POST } from "@/app/api/webhooks/hubtel/route";
import { createAdminClient } from "@/lib/supabase/admin";

describe("POST /api/webhooks/hubtel (Hubtel Webhook Confirmation Engine)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createHubtelRequest(payload: Record<string, any>) {
    return new Request("http://localhost/api/webhooks/hubtel", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  function mockSupabaseOrder(existingOrder: any, updateReturn?: any) {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: updateReturn || { ...existingOrder, order_status: "confirmed", payment_status: "paid" },
            error: null,
          }),
        }),
      }),
    });

    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: existingOrder,
          error: existingOrder ? null : new Error("Order not found"),
        }),
      }),
    });

    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: mockSelect,
        update: mockUpdate,
      }),
    } as any);

    return { mockSelect, mockUpdate };
  }

  it("returns 400 when clientReference is missing in webhook payload", async () => {
    const req = createHubtelRequest({
      responseCode: "0000",
      status: "Success",
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain("Missing clientReference");
  });

  it("returns 200 and marks order confirmed and paid when responseCode is 0000", async () => {
    const existingOrder = {
      id: "order-123",
      order_status: "awaiting_payment",
      payment_status: "unpaid",
      subtotal_pesewas: 8500,
    };

    const { mockUpdate } = mockSupabaseOrder(existingOrder);

    const req = createHubtelRequest({
      Data: {
        clientReference: "order-123",
        responseCode: "0000",
        amount: 85.0,
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Order confirmed successfully");
    expect(json.orderId).toBe("order-123");
    expect(json.status).toBe("confirmed");

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        order_status: "confirmed",
        payment_status: "paid",
        amount_paid_pesewas: 8500,
      })
    );
  });

  it("is idempotent: returns 200 without double-processing if order is already paid", async () => {
    const alreadyPaidOrder = {
      id: "order-paid-123",
      order_status: "confirmed",
      payment_status: "paid",
      subtotal_pesewas: 7000,
    };

    const { mockUpdate } = mockSupabaseOrder(alreadyPaidOrder);

    const req = createHubtelRequest({
      Data: {
        clientReference: "order-paid-123",
        responseCode: "0000",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("Order already confirmed (idempotent)");
    // Should NOT call update if already paid
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it("reconciles late payment for an expired/cancelled order and flags for manual review", async () => {
    const cancelledOrder = {
      id: "order-late-123",
      order_status: "cancelled",
      payment_status: "failed",
      subtotal_pesewas: 9000,
    };

    const { mockUpdate } = mockSupabaseOrder(cancelledOrder, {
      ...cancelledOrder,
      order_status: "confirmed",
      payment_status: "paid",
      manual_review_required: true,
    });

    const req = createHubtelRequest({
      Data: {
        clientReference: "order-late-123",
        responseCode: "0000",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toContain("Order reconciled with late payment flag");
    expect(json.lateReconciled).toBe(true);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        order_status: "confirmed",
        payment_status: "paid",
        manual_review_required: true,
        cancellation_reason: expect.stringContaining("Late payment received after 15m expiration"),
      })
    );
  });

  it("returns 200 and confirms order when status is Success (flat payload)", async () => {
    const existingOrder = {
      id: "order-456",
      order_status: "awaiting_payment",
      payment_status: "unpaid",
      subtotal_pesewas: 7000,
    };

    mockSupabaseOrder(existingOrder);

    const req = createHubtelRequest({
      clientReference: "order-456",
      status: "Success",
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe("Order confirmed successfully");
    expect(json.orderId).toBe("order-456");
  });

  it("returns 400 when payment status is not successful or pending", async () => {
    const req = createHubtelRequest({
      Data: {
        clientReference: "order-789",
        responseCode: "4001",
        status: "Failed",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("Payment not successful or pending");
    expect(json.status).toBe("Failed");
  });

  it("returns 500 when database update fails during webhook processing", async () => {
    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "order-err", order_status: "awaiting_payment", payment_status: "unpaid" },
              error: null,
            }),
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: new Error("Database connection dropped"),
              }),
            }),
          }),
        }),
      }),
    } as any);

    const req = createHubtelRequest({
      Data: {
        clientReference: "order-err",
        responseCode: "0000",
      },
    });

    const res = await POST(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.message).toBe("Database connection dropped");
  });

  describe("Webhook Security & Secret Validation", () => {
    const originalSecret = process.env.HUBTEL_WEBHOOK_SECRET;

    beforeEach(() => {
      process.env.HUBTEL_WEBHOOK_SECRET = "super-secret-hubtel-key";
    });

    afterEach(() => {
      process.env.HUBTEL_WEBHOOK_SECRET = originalSecret;
    });

    it("returns 401 Unauthorized when signature is missing", async () => {
      const req = new Request("http://localhost/api/webhooks/hubtel", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          clientReference: "order-123",
          responseCode: "0000",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("returns 401 Unauthorized when signature does not match", async () => {
      const req = new Request("http://localhost/api/webhooks/hubtel", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hubtel-signature": "wrong-secret",
        },
        body: JSON.stringify({
          clientReference: "order-123",
          responseCode: "0000",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.error).toBe("Unauthorized");
    });

    it("accepts valid signature via x-hubtel-signature header", async () => {
      mockSupabaseOrder({
        id: "order-sec",
        order_status: "awaiting_payment",
        payment_status: "unpaid",
        subtotal_pesewas: 7000,
      });

      const req = new Request("http://localhost/api/webhooks/hubtel", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-hubtel-signature": "super-secret-hubtel-key",
        },
        body: JSON.stringify({
          clientReference: "order-sec",
          responseCode: "0000",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.message).toBe("Order confirmed successfully");
    });
  });
});
