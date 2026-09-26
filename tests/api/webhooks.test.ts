import { describe, it, expect, vi, beforeEach } from "vitest";
import crypto from "node:crypto";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import { POST } from "@/app/api/webhooks/paystack/route";
import { createAdminClient } from "@/lib/supabase/admin";

describe("POST /api/webhooks/paystack (Webhook Confirmation Engine)", () => {
  const secret = "test_paystack_secret_key";

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYSTACK_SECRET_KEY = secret;
  });

  function createSignedRequest(body: Record<string, any>, signWithSecret: string = secret) {
    const rawBody = JSON.stringify(body);
    const signature = crypto
      .createHmac("sha512", signWithSecret)
      .update(rawBody)
      .digest("hex");

    return new Request("http://localhost/api/webhooks/paystack", {
      method: "POST",
      headers: {
        "x-paystack-signature": signature,
        "content-type": "application/json",
      },
      body: rawBody,
    });
  }

  it("returns 400 when x-paystack-signature header is missing", async () => {
    const req = new Request("http://localhost/api/webhooks/paystack", {
      method: "POST",
      body: JSON.stringify({ event: "charge.success" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Missing signature header");
  });

  it("returns 400 when signature does not match secret HMAC (tampered payload)", async () => {
    const req = createSignedRequest(
      { event: "charge.success" },
      "wrong_secret_key"
    );

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid signature");
  });

  it("returns 400 when payment currency is not GHS", async () => {
    const payload = {
      event: "charge.success",
      data: {
        reference: "CAF-12345",
        amount: 8500,
        currency: "USD", // Not GHS
      },
    };
    const req = createSignedRequest(payload);

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid currency");
  });

  it("returns 200 with alreadyProcessed when webhook was already processed (Idempotency)", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-1",
            subtotal_pesewas: 8500,
            payment_status: "paid", // Already paid!
            order_status: "confirmed",
          },
          error: null,
        }),
      }),
    };
    (createAdminClient as any).mockReturnValue(mockSupabase);

    const payload = {
      event: "charge.success",
      data: {
        reference: "CAF-12345",
        amount: 8500,
        currency: "GHS",
      },
    };
    const req = createSignedRequest(payload);

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.alreadyProcessed).toBe(true);
  });

  it("returns 400 when paid amount does not equal order subtotal (Price tampering / partial payment)", async () => {
    const mockSupabase = {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: {
            id: "order-1",
            subtotal_pesewas: 8500, // Expected 8500
            payment_status: "unpaid",
            order_status: "awaiting_payment",
          },
          error: null,
        }),
      }),
    };
    (createAdminClient as any).mockReturnValue(mockSupabase);

    const payload = {
      event: "charge.success",
      data: {
        reference: "CAF-12345",
        amount: 100, // Only 100 pesewas!
        currency: "GHS",
      },
    };
    const req = createSignedRequest(payload);

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Amount mismatch");
  });

  it("authoritatively confirms order upon valid charge.success and reserves capacity", async () => {
    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === "orders") {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            single: vi.fn().mockResolvedValue({
              data: {
                id: "order-1",
                subtotal_pesewas: 8500,
                payment_status: "unpaid",
                order_status: "awaiting_payment",
              },
              error: null,
            }),
            update: mockUpdate,
          };
        }
        return {} as any;
      }),
      rpc: vi.fn().mockResolvedValue({
        data: true, // Capacity reserved successfully!
        error: null,
      }),
    };
    (createAdminClient as any).mockReturnValue(mockSupabase);

    const payload = {
      event: "charge.success",
      data: {
        reference: "CAF-12345",
        amount: 8500,
        currency: "GHS",
      },
    };
    const req = createSignedRequest(payload);

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.received).toBe(true);

    // Verify order was transitioned to confirmed
    expect(mockUpdate).toHaveBeenCalledWith({
      payment_status: "paid",
      order_status: "confirmed",
      amount_paid_pesewas: 8500,
    });
  });
});
