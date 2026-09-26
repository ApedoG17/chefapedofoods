"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, ShieldCheck, Flame } from "lucide-react";
import { ORDERING_HOURS } from "@/config/business";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 12, y: -y * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-brand-red text-white pt-10 pb-16 sm:pb-20 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Bold Typography & Dominant CTA */}
          <div className="lg:col-span-6 space-y-6 text-left z-10">
            {/* Cutoff pill badge */}
            <div className="inline-flex items-center gap-2 bg-black/20 text-brand-yellow px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border border-white/10">
              <Clock className="w-3.5 h-3.5" />
              <span>Lunch Cutoff: {ORDERING_HOURS.sameDayCutoff} GMT</span>
            </div>

            {/* Enormous, high-impact headline */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.75rem] leading-[1.05] tracking-tight text-white uppercase">
              Order Your <br />
              <span className="text-brand-yellow">Accra Favorites</span> <br />
              In Minutes.
            </h1>

            {/* Supporting copy */}
            <p className="text-sm sm:text-base text-white/90 max-w-lg leading-relaxed font-sans font-normal">
              Authentic Ghanaian home cooking, simmered slowly with real local aromatics.
              Cooked fresh every morning in small batches and delivered piping hot across Accra.
            </p>

            {/* Strong Order Now CTA */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-sm sm:text-base tracking-wide transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow"
              >
                <span>Order Today&apos;s Lunch</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>

              <Link
                href="#featured-menu"
                className="inline-flex items-center justify-center px-6 py-4 rounded-full bg-black/20 hover:bg-black/30 border border-white/20 text-white font-bold text-sm tracking-wide transition-colors"
              >
                <span>View Menu</span>
              </Link>
            </div>

            {/* Trust points */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-brand-yellow" />
                <span>Small batch morning cooking</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-yellow" />
                <span>100% Real local ingredients</span>
              </span>
            </div>
          </div>

          {/* Right Column: Hero Food Photography Breaking Out with 3D Depth */}
          <div className="lg:col-span-6 flex items-center justify-center relative">
            <div
              style={{
                transform: `perspective(1000px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                transition: prefersReducedMotion ? "none" : "transform 0.15s ease-out",
              }}
              className="relative w-full max-w-[520px] aspect-[4/3] rounded-3xl overflow-hidden shadow-food-depth border-2 border-white/15 group"
            >
              <Image
                src="/images/meals/jollof-rice.jpg"
                alt="Chef Apedo Smoky Fire Jollof Rice with brass spoon and fresh herbs"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 520px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Tag overlay */}
              <div className="absolute top-4 left-4 bg-brand-yellow text-brand-dark text-xs font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                Accra&apos;s Favorite
              </div>

              {/* Bottom floating price pill */}
              <div className="absolute bottom-4 right-4 bg-brand-dark/90 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/15 flex items-center gap-2">
                <span className="text-xs text-white/70">From</span>
                <span className="font-display font-extrabold text-brand-yellow text-base">
                  GH₵45.00
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inverted Chevron Pointer Transition into Cream (Reference Image 2) */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-center translate-y-full z-20 pointer-events-none">
        <div className="hero-chevron-pointer" />
      </div>
    </section>
  );
}
