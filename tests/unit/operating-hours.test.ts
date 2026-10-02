import { describe, it, expect } from "vitest";
import {
  ASAP_HOURS,
  OPERATING_TIMEZONE,
  getAsapOperatingStatus,
  formatFriendlyTime,
  parseTimeStringToMinutes,
} from "@/lib/operating-hours";

describe("ASAP Operating Hours Guard (lib/operating-hours)", () => {
  it("defines the exact constants for Africa/Accra timezone", () => {
    expect(OPERATING_TIMEZONE).toBe("Africa/Accra");
    expect(ASAP_HOURS.open).toBe("08:00");
    expect(ASAP_HOURS.close).toBe("15:00");
  });

  it("parses time strings to accurate minutes", () => {
    expect(parseTimeStringToMinutes("08:00")).toBe(480);
    expect(parseTimeStringToMinutes("15:00")).toBe(900);
  });

  it("formats 24h time strings to friendly 12h representation", () => {
    expect(formatFriendlyTime("08:00")).toBe("8:00 AM");
    expect(formatFriendlyTime("15:00")).toBe("3:00 PM");
  });

  it("blocks ASAP orders before 08:00 AM (e.g. 07:59 AM)", () => {
    const morningEarly = new Date("2026-10-01T07:59:00Z");
    const status = getAsapOperatingStatus(morningEarly);
    expect(status.isOpen).toBe(false);
    expect(status.reason).toContain("ASAP orders are open 8:00 AM to 3:00 PM");
  });

  it("permits ASAP orders at 08:00 AM exactly", () => {
    const openingTime = new Date("2026-10-01T08:00:00Z");
    const status = getAsapOperatingStatus(openingTime);
    expect(status.isOpen).toBe(true);
    expect(status.reason).toBeUndefined();
  });

  it("permits ASAP orders throughout the midday rush (e.g. 12:45 PM)", () => {
    const lunchRush = new Date("2026-10-01T12:45:00Z");
    const status = getAsapOperatingStatus(lunchRush);
    expect(status.isOpen).toBe(true);
  });

  it("permits ASAP orders right before closing (e.g. 14:59)", () => {
    const justBeforeClose = new Date("2026-10-01T14:59:00Z");
    const status = getAsapOperatingStatus(justBeforeClose);
    expect(status.isOpen).toBe(true);
  });

  it("blocks ASAP orders at 15:00 exactly", () => {
    const atClose = new Date("2026-10-01T15:00:00Z");
    const status = getAsapOperatingStatus(atClose);
    expect(status.isOpen).toBe(false);
    expect(status.reason).toContain("ASAP orders are open 8:00 AM to 3:00 PM");
  });

  it("blocks rogue late-night ASAP orders (e.g. 23:30)", () => {
    const lateNight = new Date("2026-10-01T23:30:00Z");
    const status = getAsapOperatingStatus(lateNight);
    expect(status.isOpen).toBe(false);
    expect(status.reason).toContain("ASAP orders are open 8:00 AM to 3:00 PM");
  });
});
