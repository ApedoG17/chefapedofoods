import { describe, it, expect } from "vitest";
import {
  calculateZoneETA,
  getZoneTransitMinutes,
  getAvailableDeliverySlots,
  MASTER_DELIVERY_SLOTS,
} from "@/lib/delivery/eta";

describe("Logistics Timing Engine (lib/delivery/eta)", () => {
  it("resolves zone transit times correctly", () => {
    expect(getZoneTransitMinutes("Evandy Hostel")).toBe(10);
    expect(getZoneTransitMinutes("Pentagon")).toBe(10);
    expect(getZoneTransitMinutes("Main Campus")).toBe(12);
    expect(getZoneTransitMinutes("East Legon")).toBe(18);
    expect(getZoneTransitMinutes("Airport Residential")).toBe(20);
    expect(getZoneTransitMinutes("Osu")).toBe(25);
    expect(getZoneTransitMinutes("Spintex")).toBe(30);
    expect(getZoneTransitMinutes("Unknown Area")).toBe(15); // Default fallback
  });

  it("calculates dynamic ASAP ETA combining prep and transit", () => {
    // Fixed time: 12:00 PM UTC
    const mockNow = new Date("2026-10-01T12:00:00.000Z");
    const result = calculateZoneETA("Evandy Hostel", 20, mockNow);

    expect(result.transitMinutes).toBe(10);
    expect(result.prepMinutes).toBe(20);
    expect(result.minTotalMinutes).toBe(30); // 20 + 10
    expect(result.maxTotalMinutes).toBe(40); // 30 + 10
    expect(result.etaRange).toBe("30–40 mins");
    expect(result.slotDescriptor).toBe("ASAP (30–40 mins)");
    expect(result.etaWindow).toBe("12:30 PM – 12:40 PM");
  });

  it("filters past delivery slots strictly with Time Guard", () => {
    // Fixed time: 13:15 UTC (1:15 PM Accra time)
    const mockNow = new Date("2026-10-01T13:15:00.000Z");
    const slots = getAvailableDeliverySlots(mockNow, 20);

    // Slots at 11:30, 12:00, 12:30, 13:00 must be unavailable (in past)
    // Slot at 13:30 (1:30 PM) is 15 minutes away, which is less than 20 min prep buffer -> also unavailable!
    const slot1130 = slots.find((s) => s.id === "11:30");
    const slot1200 = slots.find((s) => s.id === "12:00");
    const slot1230 = slots.find((s) => s.id === "12:30");
    const slot1300 = slots.find((s) => s.id === "13:00");
    const slot1330 = slots.find((s) => s.id === "13:30");
    const slot1400 = slots.find((s) => s.id === "14:00");

    expect(slot1130?.available).toBe(false);
    expect(slot1200?.available).toBe(false);
    expect(slot1230?.available).toBe(false);
    expect(slot1300?.available).toBe(false);
    expect(slot1330?.available).toBe(false); // Within 20 min prep buffer

    // Slot at 14:00 (2:00 PM) is 45 minutes away -> available!
    expect(slot1400?.available).toBe(true);
  });
});
