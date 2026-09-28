"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, Bike, ShieldCheck, Flame, CreditCard, Banknote, CheckCircle2 } from "lucide-react";
import { ORDERING_HOURS, EXCLUDED_DELIVERY_AREAS } from "@/config/business";

export default function HomePage() {
  const shouldReduceMotion = useReducedMotion();

  // Factual repeating marquee items per Phase 2 instructions
  const marqueeItems = [
    "GHANAIAN FOOD",
    "ACCRA DELIVERY",
    "ORDER ONLINE",
    "FOOD PAID ONLINE",
    "DELIVERY FEE PAID TO RIDER",
  ];

  return (
    <div className="w-full min-h-screen bg-brand-cream text-brand-dark flex flex-col relative selection:bg-brand-yellow selection:text-brand-dark">
      {/* ========================================================================= */}
      {/* PHASE 1 — IMMERSIVE HERO (90vh to 100vh)                                  */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center bg-[#18110E] text-white pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle, heavily blurred real food photography in background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
          <Image
            src="/images/meals/jollof-isolated.png"
            alt="Chef Apedo Foods Background"
            fill
            sizes="100vw"
            priority
            className="object-cover scale-125 blur-3xl translate-y-12"
          />
          {/* Gradient overlay from Dark Roast #18110E to Brand Red #9E1B15 */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#18110E]/90 via-[#18110E]/70 to-[#801410]/85" />
        </div>

        {/* Ambient atmospheric glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-brand-red/30 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-4xl mx-auto text-center my-auto space-y-6 sm:space-y-8 flex flex-col items-center">
          {/* 1. Official Brand Light Logo Asset */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex justify-center"
          >
            <div className="relative w-48 sm:w-64 md:w-72 aspect-[431/280]">
              <Image
                src="/images/chef_apedo_logo_variations/logo-light-on-dark.png"
                alt="Chef Apedo Foods"
                fill
                priority
                sizes="(max-width: 640px) 192px, (max-width: 768px) 256px, 288px"
                className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.6)]"
              />
            </div>
          </motion.div>

          {/* 2. Factual Editorial Headline */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="space-y-3"
          >
            <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl lg:text-[4.25rem] uppercase tracking-tight leading-[1.05] text-white">
              Ghanaian Food. <br />
              <span className="text-brand-yellow">Made to Order.</span>
            </h1>

            <p className="text-sm sm:text-base md:text-lg text-white/85 max-w-xl mx-auto font-sans font-normal leading-relaxed pt-1">
              Authentic Ghanaian midday staples slow-simmered in small morning batches and dispatched hot across Accra.
            </p>
          </motion.div>

          {/* 3. Primary CTA with Restrained Spring */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.35,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="pt-2"
          >
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 sm:py-4.5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-sm sm:text-base uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow cursor-pointer"
            >
              <span>View Menu &amp; Order</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </motion.div>

          {/* Operational Hours Pill */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-3 flex flex-wrap items-center justify-center gap-4 text-xs text-white/70 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Ordering: {ORDERING_HOURS.opensAt} – {ORDERING_HOURS.closesAt} GMT</span>
            </span>
            <span>·</span>
            <span>Same-Day Cutoff: {ORDERING_HOURS.sameDayCutoff} GMT</span>
            <span>·</span>
            <span>First Delivery: {ORDERING_HOURS.firstDeliverySlot} GMT</span>
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* PHASE 2 — BRAND MARQUEE (BOTTOM OF HERO)                                  */}
        {/* ========================================================================= */}
        <div className="w-full mt-10 sm:mt-12 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden bg-[#18110E] py-4 border-y border-white/10 flex">
          <div className="flex whitespace-nowrap animate-marquee items-center shrink-0">
            {/* FIRST SET OF ITEMS */}
            {marqueeItems.map((item, index) => (
              <div key={`set1-${index}`} className="flex items-center">
                <span className="text-brand-yellow font-black tracking-widest text-sm md:text-base px-8 font-display uppercase">
                  {item}
                </span>
                <span className="text-white/30 text-xs">■</span>
              </div>
            ))}

            {/* SECOND SET OF ITEMS (Exact Duplicate for the seamless loop) */}
            {marqueeItems.map((item, index) => (
              <div key={`set2-${index}`} className="flex items-center">
                <span className="text-brand-yellow font-black tracking-widest text-sm md:text-base px-8 font-display uppercase">
                  {item}
                </span>
                <span className="text-white/30 text-xs">■</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHASE 3 — EDITORIAL MENU TEASER (WARM CREAM #FAF5EE)                      */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FAF5EE] text-brand-dark py-16 sm:py-24 border-b border-brand-cream-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Editorial Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-cream-dark pb-4 text-left">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
                Section 01 · Handcrafted Staples
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-brand-dark mt-1">
                The Daily Menu.
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-muted max-w-sm">
              Authentic Ghanaian staples simmered fresh each morning in small batches. Choose your base size, customize included proteins, and order online.
            </p>
          </div>

          {/* Asymmetric 3-Item Layout (Featured Jollof + Companion Pair) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pt-6">
            {/* 1. Featured Jollof Rice (Spans 2 columns on desktop) */}
            <div className="md:col-span-2">
              <div className="relative rounded-3xl p-6 sm:p-8 bg-white border border-brand-cream-dark shadow-md flex flex-col justify-between pt-24 sm:pt-32 mt-16 sm:mt-20 group hover:shadow-xl transition-all duration-300">
                {/* Out-of-Bounds Real Food Artwork */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-20 sm:-top-28 w-56 h-56 sm:w-68 sm:h-68 pointer-events-none transition-transform duration-300 ease-out group-hover:scale-105">
                  <Image
                    src="/images/meals/jollof-isolated.png"
                    alt="Jollof Rice"
                    fill
                    sizes="(max-width: 768px) 240px, 300px"
                    className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)] select-none"
                  />
                </div>

                <div className="flex items-center justify-end mb-4">
                  <span className="text-[11px] font-bold text-brand-muted">
                    Customizable Base
                  </span>
                </div>

                <div className="space-y-2 mb-6 text-left">
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-brand-dark">
                    Jollof Rice
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed line-clamp-2">
                    Ghanaian-style smoky jollof rice prepared fresh each morning in small batches with real local aromatics.
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold">
                    <span className="px-3 py-1 rounded-full bg-brand-cream border border-brand-cream-dark text-brand-dark">
                      Small: GH₵45
                    </span>
                    <span className="px-3 py-1 rounded-full bg-brand-cream border border-brand-cream-dark text-brand-dark">
                      Medium: GH₵70
                    </span>
                    <span className="px-3 py-1 rounded-full bg-brand-cream border border-brand-cream-dark text-brand-dark">
                      Large: GH₵90
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                      From
                    </span>
                    <span className="font-display font-black text-2xl tracking-tight text-brand-dark">
                      GH₵45.00
                    </span>
                  </div>

                  <Link
                    href="/menu"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <span>View On Menu</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Fried Rice (1 Column) */}
            <div className="col-span-1">
              <div className="relative rounded-3xl p-6 bg-white border border-brand-cream-dark shadow-md flex flex-col justify-between pt-20 sm:pt-24 mt-14 sm:mt-16 group hover:shadow-xl transition-all duration-300">
                <div className="absolute left-1/2 -translate-x-1/2 -top-14 sm:-top-18 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none transition-transform duration-300 ease-out group-hover:scale-105">
                  <Image
                    src="/images/meals/fried-rice-isolated.png"
                    alt="Fried Rice"
                    fill
                    sizes="180px"
                    className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.3)] select-none"
                  />
                </div>

                <div className="flex items-center justify-end mb-4">
                  <span className="text-[11px] font-bold text-brand-muted">
                    Customizable Base
                  </span>
                </div>

                <div className="space-y-2 mb-6 text-left">
                  <h3 className="font-display font-extrabold text-lg sm:text-xl uppercase tracking-tight text-brand-dark">
                    Fried Rice
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed line-clamp-2">
                    Ghanaian-style seasoned wok fried rice with crisp garden vegetables and tender seasonings.
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                      From
                    </span>
                    <span className="font-display font-black text-2xl tracking-tight text-brand-dark">
                      GH₵45.00
                    </span>
                  </div>

                  <Link
                    href="/menu"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>

            {/* 3. Plain Rice & Stew (1 Column) */}
            <div className="col-span-1">
              <div className="relative rounded-3xl p-6 bg-white border border-brand-cream-dark shadow-md flex flex-col justify-between pt-20 sm:pt-24 mt-14 sm:mt-16 group hover:shadow-xl transition-all duration-300">
                <div className="absolute left-1/2 -translate-x-1/2 -top-14 sm:-top-18 w-36 h-36 sm:w-44 sm:h-44 pointer-events-none transition-transform duration-300 ease-out group-hover:scale-105">
                  <Image
                    src="/images/meals/plain-rice-isolated.png"
                    alt="Plain Rice & Stew"
                    fill
                    sizes="180px"
                    className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.3)] select-none"
                  />
                </div>

                <div className="flex items-center justify-end mb-4">
                  <span className="text-[11px] font-bold text-brand-muted">
                    Customizable Base
                  </span>
                </div>

                <div className="space-y-2 mb-6 text-left">
                  <h3 className="font-display font-extrabold text-lg sm:text-xl uppercase tracking-tight text-brand-dark">
                    Plain Rice &amp; Stew
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-muted leading-relaxed line-clamp-2">
                    Fluffy steamed white jasmine rice served with Chef Apedo&apos;s authentic rich tomato and meat stew.
                  </p>
                </div>

                <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">
                      From
                    </span>
                    <span className="font-display font-black text-2xl tracking-tight text-brand-dark">
                      GH₵45.00
                    </span>
                  </div>

                  <Link
                    href="/menu"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHASE 4 — HOW IT WORKS / PAYMENT (THE 4 STEPS)                            */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#18110E] text-white py-16 sm:py-24 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-yellow">
              Ordering Process
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white">
              How Ordering Works.
            </h2>
            <p className="text-xs sm:text-sm text-white/70 max-w-lg mx-auto leading-relaxed">
              A transparent four-step ordering and payment protocol designed for speed and clarity.
            </p>
          </div>

          {/* 4 Steps Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-3">
                <span className="font-display font-black text-2xl text-brand-yellow">
                  01
                </span>
                <h3 className="font-display font-extrabold text-lg uppercase tracking-tight text-white">
                  Choose Your Meal
                </h3>
                <p className="text-xs text-white/75 leading-relaxed">
                  Select your daily base (Jollof, Fried Rice, or Plain Rice &amp; Stew) and choose your size: Small, Medium, or Large.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-3">
                <span className="font-display font-black text-2xl text-brand-yellow">
                  02
                </span>
                <h3 className="font-display font-extrabold text-lg uppercase tracking-tight text-white">
                  Customize Order
                </h3>
                <p className="text-xs text-white/75 leading-relaxed">
                  Choose your included protein package (Chicken, Sausage, or Eggs) and add extra sides if desired.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white/5 rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-3">
                <span className="font-display font-black text-2xl text-brand-yellow">
                  03
                </span>
                <h3 className="font-display font-extrabold text-lg uppercase tracking-tight text-white">
                  Pay Food Online
                </h3>
                <p className="text-xs text-white/75 leading-relaxed">
                  Prepay your food subtotal securely during checkout via Paystack with MTN MoMo, Telecel Cash, or card before cooking begins.
                </p>
              </div>
              <div className="text-[10px] font-bold text-brand-yellow uppercase tracking-wider">
                Prepaid to Kitchen
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-brand-red/25 rounded-3xl p-6 sm:p-7 border border-brand-red/50 flex flex-col justify-between space-y-4 text-left">
              <div className="space-y-3">
                <span className="font-display font-black text-2xl text-brand-yellow">
                  04
                </span>
                <h3 className="font-display font-extrabold text-lg uppercase tracking-tight text-white">
                  Pay Rider on Delivery
                </h3>
                <p className="text-xs text-white/75 leading-relaxed">
                  Pay the delivery fee directly to the courier upon arrival (Cash or MoMo to rider). Food and rider fees are never combined.
                </p>
              </div>
              <div className="text-[10px] font-bold text-brand-yellow uppercase tracking-wider">
                Paid Directly to Rider
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHASE 5 — DELIVERY CTA SECTION                                            */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FAF5EE] text-brand-dark py-16 sm:py-24 border-b border-brand-cream-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-brand-red/10 text-brand-red px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-brand-red/20">
            <Bike className="w-3.5 h-3.5" />
            <span>Accra Midday Dispatch Service</span>
          </div>

          <h2 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl uppercase tracking-tight text-brand-dark leading-[1.05]">
            Delivered Hot Across Accra.
          </h2>

          <p className="text-sm sm:text-base text-brand-muted max-w-xl mx-auto leading-relaxed">
            We deliver midday meals across central Accra including Legon, Airport, Osu, Cantonments, Labone, and Spintex. Same-day orders lock at {ORDERING_HOURS.sameDayCutoff} GMT with first dispatch starting at {ORDERING_HOURS.firstDeliverySlot} GMT.
          </p>

          <div className="text-xs text-brand-muted pb-2">
            <span className="font-bold text-brand-dark">Excluded Outer Areas:</span>{" "}
            {EXCLUDED_DELIVERY_AREAS.join(", ")} (to prevent cold food transit delays).
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/delivery"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-button-red transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>See Delivery Information</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-black/5 hover:bg-black/10 border border-black/10 text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>Explore The Menu</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
