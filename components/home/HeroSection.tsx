"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Clock, Flame, ShieldCheck } from "lucide-react";
import { ORDERING_HOURS } from "@/config/business";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }
    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // Compute 3D rotation transforms from mouse coordinates
  const rotateY = mousePos.x * 16; // -8 to +8 degrees
  const rotateX = -mousePos.y * 16; // -8 to +8 degrees
  const translateX = mousePos.x * 20;
  const translateY = mousePos.y * 20;

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[92vh] flex items-center justify-center bg-brand-espresso text-ink overflow-hidden pt-8 pb-20 md:py-24"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[380px] h-[380px] bg-brand-red/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[420px] h-[420px] bg-brand-gold/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Decorative grain / glow elements */}
      <div className="absolute inset-0 bg-[radial-gradient(#C9A24C_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Editorial Typography */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            {/* Live operational pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-surface2/80 border border-brand-gold/30 text-xs shadow-sm backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
              <span className="font-semibold text-brand-gold tracking-wide uppercase text-[10.5px]">
                Orders Open
              </span>
              <span className="text-ink-dim">·</span>
              <span className="text-ink-dim flex items-center gap-1 text-[11px]">
                <Clock className="w-3 h-3 text-brand-gold" />
                Cutoff {ORDERING_HOURS.sameDayCutoff} GMT
              </span>
            </div>

            {/* Massive punchy statement headline */}
            <h1 className="font-serif font-black text-4xl sm:text-5xl md:text-6xl xl:text-7xl text-ink leading-[1.05] tracking-tight">
              REAL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-yellow to-brand-gold-soft">
                GHANAIAN
              </span> <br />
              FOOD. <br />
              <span className="font-sans font-light italic text-2xl sm:text-3xl md:text-4xl text-ink-dim block mt-1">
                Made Fresh. Delivered Hot.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-ink-dim max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Small-batch home cooking prepared fresh from scratch every morning.
              Order by 10:00 AM for same-day lunch delivery across central Accra.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-brand-gold text-brand-espresso font-bold text-sm sm:text-base shadow-gold-glow hover:bg-brand-gold-soft hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                <span>Order Today&apos;s Lunch</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="#menu-showcase"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-full bg-surface2/60 border border-line text-ink font-medium text-sm sm:text-base hover:bg-white/10 hover:border-brand-gold/40 transition-all duration-200"
              >
                <span>Explore Meals</span>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-ink-dim border-t border-line/50">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-brand-red" />
                <span>Wood-Fire Smoky Aroma</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-gold" />
                <span>Cooked Daily To Order</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-yellow" />
                <span>Zero AI Fake Photos</span>
              </div>
            </div>
          </div>

          {/* Right Column: Massive 3D Hero Food Presentation */}
          <div className="lg:col-span-6 flex items-center justify-center relative perspective-1000 mt-6 lg:mt-0">
            {/* Outer Food Container with Mouse-Tracking Parallax */}
            <div
              style={{
                transform: isClient
                  ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${translateX}px, ${translateY}px, 0px)`
                  : "none",
                transition: isClient ? "transform 0.15s ease-out" : "none",
              }}
              className="relative w-full max-w-[440px] sm:max-w-[500px] lg:max-w-[540px] aspect-square flex items-center justify-center preserve-3d"
            >
              {/* Golden circular backdrop halo */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-brand-red/40 via-brand-gold/30 to-brand-yellow/20 blur-2xl transform -translate-z-10 animate-pulse-glow" />

              {/* Decorative Rotating Ring */}
              <div className="absolute -inset-2 rounded-full border border-brand-gold/20 border-dashed animate-spin [animation-duration:90s] pointer-events-none" />

              {/* The Star: Real Jollof Rice Photo in Art-Directed Container */}
              <div className="relative w-[90%] h-[90%] rounded-full overflow-hidden shadow-food-depth border-4 border-brand-gold/30 group">
                <Image
                  src="/images/meals/jollof-rice.jpg"
                  alt="Authentic Chef Apedo smoky fire Jollof Rice with brass spoon and fresh herbs"
                  fill
                  priority
                  sizes="(max-width: 768px) 90vw, 540px"
                  className="object-cover scale-105 group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/60 via-transparent to-transparent opacity-60" />
              </div>

              {/* Floating Badge 1: Top Left - Signature Dish */}
              <div
                style={{
                  transform: isClient
                    ? `translate3d(${-translateX * 0.8}px, ${-translateY * 0.8}px, 40px)`
                    : "none",
                }}
                className="absolute -top-3 -left-2 sm:top-2 sm:left-0 z-20 glass-card px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-ambient-float"
              >
                <div className="w-7 h-7 rounded-xl bg-brand-red flex items-center justify-center text-white text-xs font-bold shadow-md">
                  🔥
                </div>
                <div>
                  <div className="text-[10px] tracking-wider uppercase font-semibold text-brand-gold">
                    Signature
                  </div>
                  <div className="text-xs font-serif font-bold text-ink">
                    Smoky Fire Jollof
                  </div>
                </div>
              </div>

              {/* Floating Badge 2: Bottom Right - Starting Price */}
              <div
                style={{
                  transform: isClient
                    ? `translate3d(${translateX * 0.6}px, ${translateY * 0.6}px, 60px)`
                    : "none",
                }}
                className="absolute -bottom-4 -right-2 sm:bottom-4 sm:right-2 z-20 glass-card px-4 py-2.5 rounded-2xl shadow-xl border border-brand-gold/40 flex items-center gap-3 animate-ambient-float [animation-delay:2s]"
              >
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-wider text-ink-dim font-medium">
                    Meal Sizes From
                  </div>
                  <div className="font-serif font-extrabold text-brand-gold text-lg leading-none">
                    GH₵45
                  </div>
                </div>
                <Link
                  href="/menu/jollof-rice"
                  className="w-8 h-8 rounded-full bg-brand-gold text-brand-espresso flex items-center justify-center hover:bg-brand-gold-soft transition-colors shadow-md"
                  aria-label="Customize Jollof Rice"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Floating Badge 3: Top Right - Daily Freshness */}
              <div
                style={{
                  transform: isClient
                    ? `translate3d(${translateX * 0.5}px, ${-translateY * 0.5}px, 30px)`
                    : "none",
                }}
                className="hidden sm:flex absolute top-6 -right-4 z-20 glass-card px-3.5 py-2 rounded-2xl shadow-lg items-center gap-2 text-xs font-medium text-ink-dim"
              >
                <span className="w-2 h-2 rounded-full bg-brand-yellow" />
                <span>Small Batch Only</span>
              </div>
            </div>
          </div>
        </div>

        {/* Downward Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-xs text-ink-dim/80 hover:text-brand-gold transition-colors">
          <span className="tracking-widest uppercase text-[10px] font-semibold">
            Scroll to Explore
          </span>
          <div className="w-5 h-8 rounded-full border border-line flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-brand-gold animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
