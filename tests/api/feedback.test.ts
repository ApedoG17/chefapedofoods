import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase admin client
const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockInsert = vi.fn(() => ({ select: mockSelect }));
const mockFrom = vi.fn(() => ({ insert: mockInsert }));
const mockSupabase = { from: mockFrom };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}));

import { POST as submitFeedback } from "@/app/api/feedback/route";
import { sendFeedbackSMS } from "@/lib/notifications";

describe("POST /api/feedback (Customer Feedback API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if order_id is missing or rating is invalid", async () => {
    const req1 = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating: 4 }),
    });

    const res1 = await submitFeedback(req1);
    expect(res1.status).toBe(400);

    const req2 = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order_id: "order-123", rating: 6 }),
    });

    const res2 = await submitFeedback(req2);
    expect(res2.status).toBe(400);
  });

  it("returns 400 with duplicate error if already reviewed (Postgres 23505)", async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { code: "23505", message: "unique violation" },
    });

    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: "order-uuid-already-reviewed",
        rating: 5,
        customer_comment: "Second time review",
      }),
    });

    const res = await submitFeedback(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("You have already reviewed this order.");
  });

  it("returns 200 and persists review on valid submission", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "review-uuid-1",
        order_id: "order-uuid-1",
        rating: 5,
        customer_comment: "Delicious jollof rice!",
        created_at: new Date().toISOString(),
      },
      error: null,
    });

    const req = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: "order-uuid-1",
        rating: 5,
        customer_comment: "Delicious jollof rice!",
      }),
    });

    const res = await submitFeedback(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.review.rating).toBe(5);
    expect(json.review.customer_comment).toBe("Delicious jollof rice!");
  });

  it("sendFeedbackSMS formats phone and dispatches successfully", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ status: "success" }),
    } as any);

    const success = await sendFeedbackSMS(
      "0241234567",
      "Kwame Mensah",
      "order-uuid-999",
      "https://chefapedofoods.com"
    );
    expect(success).toBe(true);
    expect(fetchSpy).toHaveBeenCalled();
  });
});
