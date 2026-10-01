import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(),
}));

import {
  ORDER_EXPIRATION_MINUTES,
  getOrderExpirationDate,
  isOrderExpired,
  checkAndExpireOrder,
} from "@/lib/orders/expiration";
import { createAdminClient } from "@/lib/supabase/admin";

describe("Order Expiration Engine (lib/orders/expiration)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calculates expiration date exactly 15 minutes after order creation", () => {
    const createdAt = new Date("2026-10-01T12:00:00Z");
    const expiresAt = getOrderExpirationDate(createdAt);
    expect(expiresAt.getTime() - createdAt.getTime()).toBe(15 * 60 * 1000);
    expect(expiresAt.toISOString()).toBe("2026-10-01T12:15:00.000Z");
  });

  it("detects when an order is still within the 15-minute window", () => {
    const createdAt = "2026-10-01T12:00:00Z";
    const nowWithinWindow = new Date("2026-10-01T12:14:30Z");
    expect(isOrderExpired({ created_at: createdAt }, nowWithinWindow)).toBe(false);
  });

  it("detects when an order has passed the 15-minute window", () => {
    const createdAt = "2026-10-01T12:00:00Z";
    const nowAfterWindow = new Date("2026-10-01T12:15:01Z");
    expect(isOrderExpired({ created_at: createdAt }, nowAfterWindow)).toBe(true);
  });

  it("respects explicit expires_at timestamp if present on order", () => {
    const order = {
      created_at: "2026-10-01T12:00:00Z",
      expires_at: "2026-10-01T12:20:00Z",
    };
    const nowAt18Mins = new Date("2026-10-01T12:18:00Z");
    const nowAt21Mins = new Date("2026-10-01T12:21:00Z");

    expect(isOrderExpired(order, nowAt18Mins)).toBe(false);
    expect(isOrderExpired(order, nowAt21Mins)).toBe(true);
  });

  it("lazily cancels an order when past 15 minutes and unpaid", async () => {
    const staleOrder = {
      id: "stale-order-123",
      created_at: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      order_status: "awaiting_payment",
      payment_status: "unpaid",
      subtotal_pesewas: 7000,
    };

    const mockUpdate = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              ...staleOrder,
              order_status: "cancelled",
              payment_status: "failed",
              cancellation_reason: "Payment window expired after 15 minutes",
            },
            error: null,
          }),
        }),
      }),
    });

    vi.mocked(createAdminClient).mockReturnValue({
      from: vi.fn().mockReturnValue({
        update: mockUpdate,
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: staleOrder, error: null }),
          }),
        }),
      }),
    } as any);

    const result = await checkAndExpireOrder("stale-order-123", staleOrder);
    expect(result.isExpired).toBe(true);
    expect(result.reconciledPaid).toBe(false);
    expect(result.order.order_status).toBe("cancelled");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        order_status: "cancelled",
        payment_status: "failed",
        cancellation_reason: "Payment window expired after 15 minutes",
      })
    );
  });
});
