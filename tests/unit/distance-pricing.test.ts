import { describe, it, expect } from "vitest";
import {
  calculateHaversineDistanceKm,
  calculateDistanceDeliveryFee,
  CHEF_APEDO_KITCHEN,
  BASE_FEE_PESEWAS,
  PER_ADDITIONAL_KM_PESEWAS,
  BASE_COVERAGE_KM,
  MAX_SERVICE_RADIUS_KM,
} from "@/lib/delivery/distance";
import { calculateDistanceETA } from "@/lib/delivery/eta";

describe("Geospatial Distance & Dynamic Pricing Engine", () => {
  it("calculates 0 km distance when coordinates are identical to kitchen", () => {
    const distance = calculateHaversineDistanceKm(
      CHEF_APEDO_KITCHEN.lat,
      CHEF_APEDO_KITCHEN.lng,
      CHEF_APEDO_KITCHEN.lat,
      CHEF_APEDO_KITCHEN.lng
    );
    expect(distance).toBe(0);
  });

  it("calculates realistic distances from South Legon Drive kitchen", () => {
    // Accra Mall: 5.6205, -0.1745 (~0.8 km from South Legon Drive 5.6265, -0.1706)
    const accraMallDistance = calculateHaversineDistanceKm(
      CHEF_APEDO_KITCHEN.lat,
      CHEF_APEDO_KITCHEN.lng,
      5.6205,
      -0.1745
    );
    expect(accraMallDistance).toBeGreaterThan(0.5);
    expect(accraMallDistance).toBeLessThan(1.5);

    // Evandy Hostel: 5.6593, -0.1932 (~4.4 km)
    const evandyDistance = calculateHaversineDistanceKm(
      CHEF_APEDO_KITCHEN.lat,
      CHEF_APEDO_KITCHEN.lng,
      5.6593,
      -0.1932
    );
    expect(evandyDistance).toBeGreaterThan(3.5);
    expect(evandyDistance).toBeLessThan(5.5);
  });

  it("applies flat base fee (GH₵ 7.00 = 700 pesewas) for locations within 3km", () => {
    // Accra Mall (~0.8 km)
    const mallFee = calculateDistanceDeliveryFee(5.6205, -0.1745);
    expect(mallFee.distanceKm).toBeLessThanOrEqual(BASE_COVERAGE_KM);
    expect(mallFee.feePesewas).toBe(BASE_FEE_PESEWAS);
    expect(mallFee.feeGHS).toBe("7.00");
    expect(mallFee.isServiceable).toBe(true);
    expect(mallFee.breakdown.extraKm).toBe(0);
    expect(mallFee.breakdown.extraFeePesewas).toBe(0);
  });

  it("applies tiered pricing for locations beyond 3km (+GH₵ 2.00 per extra km)", () => {
    // Evandy Hostel (approx 4.4 km away)
    // Extra km = ceil(4.4 - 3.0) = 2 extra km
    // Fee = 700 + 2 * 200 = 1100 pesewas (GH₵ 11.00)
    const pricing = calculateDistanceDeliveryFee(5.6593, -0.1932);
    expect(pricing.distanceKm).toBeGreaterThan(BASE_COVERAGE_KM);
    const expectedExtraKm = Math.ceil(pricing.distanceKm - BASE_COVERAGE_KM);
    const expectedFee = BASE_FEE_PESEWAS + expectedExtraKm * PER_ADDITIONAL_KM_PESEWAS;
    
    expect(pricing.feePesewas).toBe(expectedFee);
    expect(pricing.feeGHS).toBe((expectedFee / 100).toFixed(2));
    expect(pricing.isServiceable).toBe(true);
  });

  it("marks distant locations outside 15km perimeter as unserviceable", () => {
    // Tema / Prampram / Kasoa (e.g. 5.5300, -0.4200 is ~27km away)
    const unserviceable = calculateDistanceDeliveryFee(5.5300, -0.4200);
    expect(unserviceable.distanceKm).toBeGreaterThan(MAX_SERVICE_RADIUS_KM);
    expect(unserviceable.isServiceable).toBe(false);
  });

  it("calculates dynamic ETA with distance transit scaling", () => {
    const testDate = new Date("2026-10-01T12:00:00Z"); // 12:00 PM GMT
    
    // 2 km: transit = max(10, round(2 * 3)) = 10 mins. Total = 20 + 10 = 30-40 mins (12:30 - 12:40 PM)
    const eta2km = calculateDistanceETA(2.0, 20, testDate);
    expect(eta2km.transitMinutes).toBe(10);
    expect(eta2km.minTotalMinutes).toBe(30);
    expect(eta2km.maxTotalMinutes).toBe(40);
    expect(eta2km.etaWindow).toBe("12:30 PM – 12:40 PM");

    // 6 km: transit = max(10, round(6 * 3)) = 18 mins. Total = 20 + 18 = 38-48 mins (12:38 - 12:48 PM)
    const eta6km = calculateDistanceETA(6.0, 20, testDate);
    expect(eta6km.transitMinutes).toBe(18);
    expect(eta6km.minTotalMinutes).toBe(38);
    expect(eta6km.maxTotalMinutes).toBe(48);
    expect(eta6km.etaWindow).toBe("12:38 PM – 12:48 PM");
  });
});
