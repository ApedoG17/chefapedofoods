import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the admin client
const mockSingle = vi.fn();
const mockIlike = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ ilike: mockIlike }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockSupabase = { from: mockFrom };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}));

import { POST } from "@/app/api/promos/validate/route";

describe("POST /api/promos/validate (Promo Code Validation API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if code is missing or empty", async () => {
    const req = new Request("http://localhost/api/promos/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Code is required");
  });

  it("returns 404 if promo code does not exist", async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: { message: "Not found" } });

    const req = new Request("http://localhost/api/promos/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "NONEXISTENT" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Invalid promo code.");
  });

  it("returns 400 if promo code is inactive", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "promo-uuid-1",
        code: "EXPIRED10",
        discount_percentage: 10,
        max_uses: null,
        current_uses: 0,
        is_active: false,
      },
      error: null,
    });

    const req = new Request("http://localhost/api/promos/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "EXPIRED10" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("This promo code is no longer active.");
  });

  it("returns 400 if promo code has reached maximum uses", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "promo-uuid-2",
        code: "MAXEDOUT",
        discount_percentage: 15,
        max_uses: 50,
        current_uses: 50,
        is_active: true,
      },
      error: null,
    });

    const req = new Request("http://localhost/api/promos/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "MAXEDOUT" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("This promo code has reached its usage limit.");
  });

  it("returns 200 with promo details when code is valid", async () => {
    mockSingle.mockResolvedValueOnce({
      data: {
        id: "promo-uuid-3",
        code: "PENT10",
        discount_percentage: 10,
        max_uses: 100,
        current_uses: 12,
        is_active: true,
      },
      error: null,
    });

    const req = new Request("http://localhost/api/promos/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "pent10" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.id).toBe("promo-uuid-3");
    expect(json.discount_percentage).toBe(10);
    expect(json.code).toBe("PENT10");
  });
});
