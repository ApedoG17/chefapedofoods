/**
 * tests/unit/landmarks.test.ts
 *
 * Unit tests for lib/delivery/landmarks.ts
 * Covers: data integrity, filterLandmarks(), and category coverage.
 */

import { describe, it, expect } from "vitest";
import {
  CAMPUS_LANDMARKS,
  LANDMARK_CATEGORIES,
  filterLandmarks,
  type CampusLandmark,
  type LandmarkCategory,
} from "@/lib/delivery/landmarks";

describe("CAMPUS_LANDMARKS data integrity", () => {
  it("should have at least 30 landmarks", () => {
    expect(CAMPUS_LANDMARKS.length).toBeGreaterThanOrEqual(30);
  });

  it("every landmark has a unique id", () => {
    const ids = CAMPUS_LANDMARKS.map((lm) => lm.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("every landmark has valid lat/lng for Ghana", () => {
    for (const lm of CAMPUS_LANDMARKS) {
      expect(lm.lat).toBeGreaterThan(4.0);
      expect(lm.lat).toBeLessThan(12.0);
      expect(lm.lng).toBeGreaterThan(-4.0);
      expect(lm.lng).toBeLessThan(2.0);
    }
  });

  it("every landmark has a non-empty name, subtext, and category", () => {
    for (const lm of CAMPUS_LANDMARKS) {
      expect(lm.name.trim().length).toBeGreaterThan(0);
      expect(lm.subtext.trim().length).toBeGreaterThan(0);
      expect(lm.category.trim().length).toBeGreaterThan(0);
    }
  });

  it("every landmark category is one of the known LANDMARK_CATEGORIES", () => {
    const validCategories = new Set<LandmarkCategory>(LANDMARK_CATEGORIES);
    for (const lm of CAMPUS_LANDMARKS) {
      expect(validCategories.has(lm.category)).toBe(true);
    }
  });

  it("LANDMARK_CATEGORIES contains exactly 6 categories", () => {
    expect(LANDMARK_CATEGORIES).toHaveLength(6);
  });

  it("each category has at least one landmark", () => {
    for (const cat of LANDMARK_CATEGORIES) {
      const count = CAMPUS_LANDMARKS.filter((lm) => lm.category === cat).length;
      expect(count).toBeGreaterThanOrEqual(1);
    }
  });

  it("key hostels are present (Evandy, Pentagon, TF, Bani, AU)", () => {
    const names = CAMPUS_LANDMARKS.map((lm) => lm.name.toLowerCase());
    expect(names.some((n) => n.includes("evandy"))).toBe(true);
    expect(names.some((n) => n.includes("pentagon"))).toBe(true);
    expect(names.some((n) => n.includes("tf hostel"))).toBe(true);
    expect(names.some((n) => n.includes("bani"))).toBe(true);
    expect(names.some((n) => n.includes("african union"))).toBe(true);
  });

  it("key halls are present (Akuafo, Commonwealth, Volta, Sarbah, Legon)", () => {
    const names = CAMPUS_LANDMARKS.map((lm) => lm.name.toLowerCase());
    expect(names.some((n) => n.includes("akuafo"))).toBe(true);
    expect(names.some((n) => n.includes("commonwealth"))).toBe(true);
    expect(names.some((n) => n.includes("volta"))).toBe(true);
    expect(names.some((n) => n.includes("sarbah"))).toBe(true);
    expect(names.some((n) => n.includes("legon hall"))).toBe(true);
  });
});

describe("filterLandmarks()", () => {
  it("returns all landmarks for empty query and null category", () => {
    const result = filterLandmarks("", null);
    expect(result).toHaveLength(CAMPUS_LANDMARKS.length);
  });

  it("filters by category only", () => {
    const result = filterLandmarks("", "Hostels");
    expect(result.length).toBeGreaterThan(0);
    for (const lm of result) {
      expect(lm.category).toBe("Hostels");
    }
  });

  it("filters by query only (case-insensitive)", () => {
    const result = filterLandmarks("eVanDy", null);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.name.toLowerCase()).toContain("evandy");
  });

  it("filters by both query and category", () => {
    const result = filterLandmarks("hall", "Halls");
    expect(result.length).toBeGreaterThan(0);
    for (const lm of result) {
      expect(lm.category).toBe("Halls");
    }
  });

  it("returns empty array when no match", () => {
    const result = filterLandmarks("xyznonexistentplace12345", null);
    expect(result).toHaveLength(0);
  });

  it("matches on subtext field too", () => {
    // "Batsonaa" is in the subtext of Spintex Road
    const result = filterLandmarks("batsonaa", null);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]!.name.toLowerCase()).toContain("spintex");
  });

  it("returns correct Greater Accra landmarks", () => {
    const result = filterLandmarks("", "Greater Accra");
    expect(result.length).toBeGreaterThan(0);
    for (const lm of result) {
      expect(lm.category).toBe("Greater Accra");
    }
  });

  it("category filter combined with partial name query", () => {
    const result = filterLandmarks("mall", "East Legon");
    // A&C Mall is in East Legon
    expect(result.some((lm) => lm.name.toLowerCase().includes("mall"))).toBe(true);
  });

  it("does not return cross-category results when category is specified", () => {
    // Accra Mall is Greater Accra; should not appear in East Legon filter
    const result = filterLandmarks("accra mall", "East Legon");
    expect(result.every((lm) => lm.category === "East Legon")).toBe(true);
  });

  it("Evandy has correct approximate coordinates", () => {
    const evandy = CAMPUS_LANDMARKS.find((lm) => lm.id === "evandy");
    expect(evandy).toBeDefined();
    expect(evandy!.lat).toBeCloseTo(5.6593, 2);
    expect(evandy!.lng).toBeCloseTo(-0.1932, 2);
  });
});