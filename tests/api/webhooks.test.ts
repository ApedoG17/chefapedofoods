import { describe, it, expect, vi, beforeEach } from "vitest";

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
    const mockOrder = {
      id: "order-123",
      order_status: "confirmed",
      payment_status: "paid",
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockOrder,
            error: null,
          }),
        }),
      }),
    });

    const mockFrom = vi.fn().mockReturnValue({
      update: mockUpdate,
    });

    vi.mocked(createAdminClient).mockReturnValue({
      from: mockFrom,
    } as any);

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

    expect(mockFrom).toHaveBeenCalledWith("orders");
    expect(mockUpdate).toHaveBeenCalledWith({
      order_status: "confirmed",
      payment_status: "paid",
    });
  });

  it("returns 200 and confirms order when status is Success (flat payload)", async () => {
    const mockOrder = {
      id: "order-456",
      order_status: "confirmed",
      payment_status: "paid",
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockOrder,
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
      }),
    } as any);

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
});
