import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedMealsSection } from "@/components/home/FeaturedMealsSection";
import { BuildYourPlateSection } from "@/components/home/BuildYourPlateSection";
import { DeliveryCoverageSection } from "@/components/home/DeliveryCoverageSection";
import { BrandStorySection } from "@/components/home/BrandStorySection";
import { StatementCTASection } from "@/components/home/StatementCTASection";

export const metadata = {
  title: "Chef Apedo Foods · Real Ghanaian Food, Made Fresh & Delivered Hot",
  description:
    "Authentic Ghanaian home cooking in Accra. Smoky fire Jollof Rice, seasoned Fried Rice, and rich Plain Rice & Stew prepared fresh daily and delivered across Accra.",
};

export default function HomePage() {
  return (
    <main className="w-full flex flex-col overflow-hidden">
      {/* 1. Hero: Deep Red Block with High-Impact Typography, Yellow Pill CTA, and 3D Tilt Food Photo */}
      <HeroSection />

      {/* 2. Featured Meals: Warm Cream Canvas with 3 Color Category Highlights & Crisp White Food Cards */}
      <FeaturedMealsSection />

      {/* 3. Build Your Plate: Vibrant Golden Yellow Color Block with Interactive Portion Architecture */}
      <BuildYourPlateSection />

      {/* 4. Accra Coverage: Dual Visual Feature Blocks (Rider Dispatch & Two-Part Payment Split) */}
      <DeliveryCoverageSection />

      {/* 5. Kitchen Promise: Deep Charcoal Block with 3 High-Impact Pillars & Chef Godwin Statement */}
      <BrandStorySection />

      {/* 6. Statement CTA: Deep Red Block with Oversized Headline & Yellow Pill CTA Button */}
      <StatementCTASection />
    </main>
  );
}
