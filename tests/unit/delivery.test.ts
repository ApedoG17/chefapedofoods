import { describe, it, expect } from "vitest";
import { isAreaServiceable, getDeliveryFeeForArea } from "@/lib/delivery";
import { EXCLUDED_DELIVERY_AREAS } from "@/config/business";

describe("Delivery Serviceability (lib/delivery)", () => {
  it("allows serviceable areas in Accra", () => {
    expect(isAreaServiceable("East Legon")).toBe(true);
    expect(isAreaServiceable("Osu")).toBe(true);
    expect(isAreaServiceable("Cantonments")).toBe(true);
    expect(isAreaServiceable("Airport Residential Area")).toBe(true);
    expect(isAreaServiceable("Spintex")).toBe(true);
  });

  it("blocks all 7 locked excluded delivery areas case-insensitively", () => {
    EXCLUDED_DELIVERY_AREAS.forEach((area) => {
      expect(isAreaServiceable(area)).toBe(false);
      expect(isAreaServiceable(area.toLowerCase())).toBe(false);
      expect(isAreaServiceable(area.toUpperCase())).toBe(false);
      expect(isAreaServiceable(`  ${area}  `)).toBe(false);
    });
  });

  it("specifically blocks Kasoa (Edge Case 3)", () => {
    expect(isAreaServiceable("Kasoa")).toBe(false);
  });

  describe("getDeliveryFeeForArea", () => {
    const mockZones = [
      {
        id: "z1",
        name: "Zone A",
        areas: ["East Legon", "Shiashie"],
        fee_pesewas: 1000,
        active: true,
      },
      {
        id: "z2",
        name: "Zone B",
        areas: ["Osu", "Cantonments"],
        fee_pesewas: 1500,
        active: true,
      },
      {
        id: "z3",
        name: "Inactive Zone",
        areas: ["Labone"],
        fee_pesewas: 2000,
        active: false,
      },
    ];

    it("matches area to zone fee case-insensitively", () => {
      expect(getDeliveryFeeForArea("East Legon", mockZones)).toBe(1000);
      expect(getDeliveryFeeForArea("east legon", mockZones)).toBe(1000);
      expect(getDeliveryFeeForArea("  Cantonments  ", mockZones)).toBe(1500);
    });

    it("returns null for inactive zones", () => {
      expect(getDeliveryFeeForArea("Labone", mockZones)).toBeNull();
    });

    it("returns null for unmatched areas", () => {
      expect(getDeliveryFeeForArea("Tema", mockZones)).toBeNull();
    });

    it("returns null for excluded areas even if present in zone list", () => {
      const zoneWithExcluded = [
        ...mockZones,
        {
          id: "z-bad",
          name: "Bad Zone",
          areas: ["Kasoa"],
          fee_pesewas: 3000,
          active: true,
        },
      ];
      expect(getDeliveryFeeForArea("Kasoa", zoneWithExcluded)).toBeNull();
    });
  });
});

