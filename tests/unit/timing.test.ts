import { describe, it, expect } from "vitest";
import {
  isSameDayOrderAllowed,
  isWithinOrderingWindow,
  isCancellationWithinPermittedWindow,
} from "@/lib/business-rules/timing";

describe("Ordering Window & Timing Rules (lib/business-rules/timing)", () => {
  it("allows same-day ordering before 10:00 AM (e.g. 09:59 AM UTC)", () => {
    const timeBeforeCutoff = new Date("2026-09-26T09:59:00Z");
    expect(isSameDayOrderAllowed(timeBeforeCutoff)).toBe(true);
  });

  it("blocks same-day ordering at 10:00 AM exactly (Edge Case 4)", () => {
    const timeAtCutoff = new Date("2026-09-26T10:00:00Z");
    expect(isSameDayOrderAllowed(timeAtCutoff)).toBe(false);
  });

  it("blocks same-day ordering after 10:00 AM (e.g. 10:01 AM, 11:30 AM)", () => {
    const timeAfterCutoff = new Date("2026-09-26T10:01:00Z");
    const afternoonTime = new Date("2026-09-26T14:30:00Z");
    expect(isSameDayOrderAllowed(timeAfterCutoff)).toBe(false);
    expect(isSameDayOrderAllowed(afternoonTime)).toBe(false);
  });

  it("enforces ordering window (6:00 AM – 5:00 PM / 17:00 UTC)", () => {
    expect(isWithinOrderingWindow(new Date("2026-09-26T05:59:00Z"))).toBe(false);
    expect(isWithinOrderingWindow(new Date("2026-09-26T06:00:00Z"))).toBe(true);
    expect(isWithinOrderingWindow(new Date("2026-09-26T12:00:00Z"))).toBe(true);
    expect(isWithinOrderingWindow(new Date("2026-09-26T16:59:00Z"))).toBe(true);
    expect(isWithinOrderingWindow(new Date("2026-09-26T17:00:00Z"))).toBe(false);
    expect(isWithinOrderingWindow(new Date("2026-09-26T21:00:00Z"))).toBe(false);
  });

  it("permits cancellation at least 60 minutes before slot (Edge Case 7)", () => {
    const slot1130 = new Date("2026-09-26T11:30:00Z");
    const now1020 = new Date("2026-09-26T10:20:00Z"); // 70 mins before
    const now1030 = new Date("2026-09-26T10:30:00Z"); // 60 mins before exactly
    const now1031 = new Date("2026-09-26T10:31:00Z"); // 59 mins before (too late)

    expect(isCancellationWithinPermittedWindow(slot1130, now1020)).toBe(true);
    expect(isCancellationWithinPermittedWindow(slot1130, now1030)).toBe(true);
    expect(isCancellationWithinPermittedWindow(slot1130, now1031)).toBe(false);
  });
});
