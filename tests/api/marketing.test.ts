import { describe, it, expect, vi, beforeEach } from "vitest";

const mockSelect = vi.fn();
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockSupabase = { from: mockFrom };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}));

import { POST as marketingBroadcast } from "@/app/api/admin/marketing/route";

describe("POST /api/admin/marketing (Marketing SMS Broadcast API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMS_API_KEY = "test_agoo_key";
    process.env.SMS_SENDER_ID = "CHEF APEDO";
  });

  it("returns 400 if message is missing or whitespace only", async () => {
    const req = new Request("http://localhost/api/admin/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   " }),
    });

    const res = await marketingBroadcast(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Message is required");
  });

  it("returns 400 if no customer phone numbers are found in database", async () => {
    mockSelect.mockResolvedValueOnce({ data: [], error: null });

    const req = new Request("http://localhost/api/admin/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hot Jollof is ready!" }),
    });

    const res = await marketingBroadcast(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("No customer phone numbers found.");
  });

  it("formats phones to 233 and dispatches with X-API-Key and senderId", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [
        { phone: "0241234567" },
        { phone: "0241234567" }, // Duplicate
        { phone: "0509876543" },
      ],
      error: null,
    });

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: "success" }),
    } as any);

    const req = new Request("http://localhost/api/admin/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "10% off today with code TASTY10!" }),
    });

    const res = await marketingBroadcast(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.count).toBe(2);
    expect(json.totalAttempted).toBe(2);

    expect(fetchSpy).toHaveBeenCalledTimes(2);

    // Verify first request used Agoo specifications
    const firstCall = fetchSpy.mock.calls[0]!;
    expect(firstCall[0]).toBe("https://api.agoosms.com/v1/sms/send");
    const options = firstCall[1] as any;
    expect(options.headers["X-API-Key"]).toBe("test_agoo_key");
    const parsedBody = JSON.parse(options.body);
    expect(parsedBody.senderId).toBe("CHEF APEDO");
    expect(parsedBody.to).toMatch(/^233/);
    expect(parsedBody.message).toBe("10% off today with code TASTY10!");
  });

  it("handles all requests failing from Agoo", async () => {
    mockSelect.mockResolvedValueOnce({
      data: [{ phone: "0241234567" }],
      error: null,
    });

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
    } as any);

    const req = new Request("http://localhost/api/admin/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Test broadcast" }),
    });

    const res = await marketingBroadcast(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain("Agoo API rejected all requests");
  });
});
