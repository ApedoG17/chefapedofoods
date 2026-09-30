import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase admin client
const mockMaybeSingle = vi.fn();
const mockLimit = vi.fn(() => ({ maybeSingle: mockMaybeSingle }));
const mockOr = vi.fn(() => ({ limit: mockLimit }));
const mockSelect = vi.fn(() => ({ or: mockOr }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockSupabase = { from: mockFrom };

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => mockSupabase),
}));

import { POST as authRider } from "@/app/api/rider/auth/route";

describe("POST /api/rider/auth (Rider Authentication API)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 if phone number is missing", async () => {
    const req = new Request("http://localhost/api/rider/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await authRider(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Phone number required");
  });

  it("returns 404 if rider does not exist", async () => {
    mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

    const req = new Request("http://localhost/api/rider/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: "0240000000" }),
    });

    const res = await authRider(req);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Rider not found. Contact Admin.");
  });

  it("returns 403 if rider account is inactive", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: "rider-uuid-1",
        full_name: "Kofi Mensah",
        phone_number: "0241112222",
        is_active: false,
      },
      error: null,
    });

    const req = new Request("http://localhost/api/rider/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: "0241112222" }),
    });

    const res = await authRider(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Your account is currently deactivated.");
  });

  it("returns 200 with rider object on valid active rider", async () => {
    mockMaybeSingle.mockResolvedValueOnce({
      data: {
        id: "rider-uuid-2",
        full_name: "Kofi Mensah",
        phone_number: "0241112222",
        is_active: true,
      },
      error: null,
    });

    const req = new Request("http://localhost/api/rider/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone_number: "0241112222" }),
    });

    const res = await authRider(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.rider.full_name).toBe("Kofi Mensah");
    expect(json.rider.id).toBe("rider-uuid-2");
  });
});
