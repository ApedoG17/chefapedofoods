import React from "react";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedMealsSection } from "@/components/home/FeaturedMealsSection";
import { BrandStorySection } from "@/components/home/BrandStorySection";
import { BuildYourPlateSection } from "@/components/home/BuildYourPlateSection";
import { DeliveryCoverageSection } from "@/components/home/DeliveryCoverageSection";
import { StatementCTASection } from "@/components/home/StatementCTASection";

export const metadata = {
  title: "Chef Apedo Foods · Real Ghanaian Food, Made Fresh & Delivered Hot",
  description:
    "Authentic Ghanaian home cooking in Accra. Smoky fire Jollof Rice, seasoned Fried Rice, and rich Plain Rice & Stew prepared fresh daily and delivered across Accra.",
};

export default function HomePage() {
  return (
    <main className="w-full flex flex-col overflow-hidden">
      {/* 1. Hero: Deep Espresso with 3D Parallax & Real Food Photography */}
      <HeroSection />

      {/* 2. Featured Meals: Warm Cream with Asymmetric Editorial Cards */}
      <FeaturedMealsSection />

      {/* 3. Artisan Story: Rich Ghanaian Red with Cooking Commitments */}
      <BrandStorySection />

      {/* 4. Build Your Plate: Warm Golden Yellow with Interactive Customization */}
      <BuildYourPlateSection />

      {/* 5. Accra Coverage: Deep Espresso with Zone Cards & Split Payment Policy */}
      <DeliveryCoverageSection />

      {/* 6. Statement CTA: Deep Espresso with Oversized Typography & Gold Glow */}
      <StatementCTASection />
    </main>
  );
}
