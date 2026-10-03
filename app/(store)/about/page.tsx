"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Code2,
  UtensilsCrossed,
  Clock,
  Banknote,
  Flame,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Quote,
} from "lucide-react";
import { ORDERING_HOURS_DISPLAY } from "@/config/business";

export default function AboutPage() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="w-full min-h-screen bg-[#FAF5EE] text-brand-dark flex flex-col relative selection:bg-brand-yellow selection:text-brand-dark">
      {/* ========================================================================= */}
      {/* 1. THE EDITORIAL HERO (60/40 ASYMMETRICAL SPLIT-SCREEN)                   */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-[#FAF5EE] border-b border-brand-cream-dark overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[85vh] lg:min-h-[88vh]">
          {/* Left Column (Editorial Typography & Content ~ 58% on Desktop) */}
          <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 md:p-14 lg:p-18 xl:p-20 z-10">
            <div className="space-y-6 sm:space-y-8 my-auto max-w-2xl text-left">
              {/* Monospace Editorial Slug */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-brand-red/10 border border-brand-red/15 text-brand-red text-xs font-black uppercase tracking-widest"
              >
                <Code2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Editorial Profile · Legon, Accra</span>
              </motion.div>

              {/* Massive Bold Display Headline */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="space-y-4"
              >
                <h1 className="font-display font-black text-4xl sm:text-6xl xl:text-[4.75rem] uppercase tracking-tight leading-[1.02] text-brand-dark">
                  Engineered for Flavor. <br />
                  <span className="text-brand-red">Built for Campus.</span>
                </h1>

                <p className="text-base sm:text-lg text-brand-muted font-sans font-normal leading-relaxed max-w-xl">
                  Where computer science systems meet authentic Ghanaian culinary craft. Small-batch midday staples cooked fresh each morning and delivered hot across Accra.
                </p>
              </motion.div>

              {/* Primary Action Button & Quick Facts */}
              <motion.div
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="pt-2 flex flex-wrap items-center gap-4"
              >
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-extrabold text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-red cursor-pointer"
                >
                  <span>Explore The Menu</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>

                <Link
                  href="/delivery"
                  className="inline-flex items-center justify-center px-7 py-4 rounded-full bg-white hover:bg-white/80 border border-brand-cream-dark text-brand-dark font-extrabold text-sm uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Delivery Zones</span>
                </Link>
              </motion.div>
            </div>

            {/* Editorial Footer Strip */}
            <div className="pt-10 border-t border-brand-cream-dark/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-left">
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-brand-muted">
                  Founder
                </span>
                <span className="font-display font-bold text-xs sm:text-sm text-brand-dark uppercase">
                  Godwin Apedo
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-mono uppercase tracking-wider text-brand-muted">
                  Origin
                </span>
                <span className="font-display font-bold text-xs sm:text-sm text-brand-dark uppercase">
                  Univ. of Ghana, Legon
                </span>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <span className="block text-[10px] font-mono uppercase tracking-wider text-brand-muted">
                  Service Window
                </span>
                <span className="font-display font-bold text-xs sm:text-sm text-brand-dark uppercase">
                  {ORDERING_HOURS_DISPLAY.opensAt} – {ORDERING_HOURS_DISPLAY.closesAt}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (Dynamic Kitchen Action Shot bleeding off the edge ~ 42% on Desktop) */}
          <div className="lg:col-span-5 relative min-h-[420px] sm:min-h-[500px] lg:min-h-full w-full bg-[#18110E] overflow-hidden">
            {/* Dynamic Kitchen Prep Video: autoplay, muted, looped, mobile-safe */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/about-prep.mp4" type="video/mp4" />
            </video>

            {/* Subtle photographic vignette and editorial film badge */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-between z-10">
              <div className="text-left space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest text-brand-yellow block">
                  Morning Kitchen Preps
                </span>
                <span className="font-display font-bold text-xs sm:text-sm uppercase tracking-wide block">
                  Small-Batch Jollof Simmering
                </span>
              </div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE FOUNDER'S NARRATIVE (MAGAZINE-STYLE NARROW COLUMN)                  */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-[#FAF5EE] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-brand-cream-dark">
        {/* Subtle decorative abstract brand elements in background */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-red/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto text-left">
          {/* Section Indicator */}
          <div className="text-center pb-8 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-brand-red font-bold">
              The Founder&apos;s Narrative
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl uppercase tracking-tight text-brand-dark">
              From Terminal to Kitchen.
            </h2>
          </div>

          {/* Magazine Column with Oversized Burgundy Quotation Marks */}
          <div className="relative pt-6 pb-4">
            <Quote className="absolute -top-3 -left-6 sm:-left-10 w-12 h-12 text-brand-red/15 stroke-[1.5] rotate-180 pointer-events-none" />

            <div className="space-y-6 text-base sm:text-lg text-brand-dark/90 font-serif leading-relaxed tracking-normal">
              <p className="first-letter:font-display first-letter:text-5xl first-letter:font-black first-letter:text-brand-red first-letter:mr-3 first-letter:float-left first-letter:leading-none">
                Balancing rigorous Computer Science coursework at the University of Ghana while running an uncompromising commercial kitchen isn&apos;t standard student life. It started as a daily friction: finding honest, hot, properly seasoned Ghanaian midday staples in Legon was either a lottery of inconsistent street stalls or slow WhatsApp threads with missing orders and surprise surcharges.
              </p>

              <p>
                The hustle took root in late-night coding sessions and early morning alarms. Between debugging distributed system architectures and managing five-day shifts near the Legon campus gates, every spare hour was spent testing tomato stew reductions, calibrating smokiness in small rice batches, and sourcing authentic local aromatics from trusted Accra markets.
              </p>

              <p>
                The &ldquo;why&rdquo; behind Chef Apedo Foods is uncompromisingly simple: students, faculty, and working professionals in Accra deserve genuinely hot, premium food paired with a frictionless digital ordering experience. No ghost-kitchen tricks, no hidden rider kickbacks, and no confusing menus.
              </p>

              <p>
                By engineering the entire software storefront and kitchen dispatch pipeline from scratch, every order has an exact batch window, an honest payment breakdown, and direct communication to the dispatch courier.
              </p>
            </div>

            <Quote className="absolute -bottom-6 -right-6 sm:-right-10 w-12 h-12 text-brand-red/15 stroke-[1.5] pointer-events-none" />
          </div>

          {/* Founder Signature & Verification Card */}
          <div className="mt-12 pt-8 border-t border-brand-cream-dark flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-brand-red text-white flex items-center justify-center font-display font-black text-base">
                GA
              </div>
              <div>
                <h4 className="font-display font-black text-sm uppercase text-brand-dark">
                  Godwin Apedo
                </h4>
                <p className="text-xs text-brand-muted">
                  Founder &amp; Software Developer · Chef Apedo Foods
                </p>
              </div>
            </div>

            <div className="text-xs font-mono text-brand-red bg-brand-red/10 px-3.5 py-1.5 rounded-full border border-brand-red/20 font-bold">
              UG Computer Science
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE INTERSECTION OF CODE & CUISINE (DARK ROAST FULL-WIDTH BREAK)        */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-[#18110E] text-white py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/10 overflow-hidden">
        {/* Subtle Watermark using logo-light-on-dark.png in background */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[550px] md:w-[700px] aspect-[431/280] opacity-5 pointer-events-none select-none blur-[1px]">
          <Image
            src="/images/chef_apedo_logo_variations/logo-light-on-dark.png"
            alt="Chef Apedo Foods Watermark"
            fill
            className="object-contain"
          />
        </div>

        <div className="relative max-w-6xl mx-auto space-y-16 z-10">
          {/* Section Header */}
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow text-xs font-mono uppercase tracking-wider font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Duality of Discipline</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white">
              Code &amp; Cuisine.
            </h2>
            <p className="text-sm sm:text-base text-white/70 max-w-lg mx-auto font-sans leading-relaxed">
              Two disciplined crafts united under one roof: modern software architecture and traditional Ghanaian culinary patience.
            </p>
          </div>

          {/* 2-Column Contrasting Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 text-left">
            {/* Left: The Tech */}
            <div className="relative rounded-3xl p-8 sm:p-10 bg-white/5 border border-white/10 flex flex-col justify-between space-y-6 hover:border-brand-yellow/40 transition-colors">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-yellow/15 text-brand-yellow flex items-center justify-center">
                  <Code2 className="w-7 h-7 stroke-[2]" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-brand-yellow font-bold block">
                    The Architecture
                  </span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
                    Pixel-Perfect Ordering.
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans">
                  The custom-built digital storefront eliminates chaotic direct messages and order mistakes. Designed with exact meal customizers, small-batch stock limits, and transparent Hubtel Mobile Money integration, customers experience zero hidden fees and real-time status updates as cooking transitions directly to courier dispatch.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 text-xs font-mono text-white/70">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  Next.js + TypeScript
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  Hubtel MoMo Integration
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  Real-time Batch Logic
                </span>
              </div>
            </div>

            {/* Right: The Taste */}
            <div className="relative rounded-3xl p-8 sm:p-10 bg-white/5 border border-white/10 flex flex-col justify-between space-y-6 hover:border-brand-red/60 transition-colors">
              <div className="space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-red/20 text-brand-yellow flex items-center justify-center">
                  <UtensilsCrossed className="w-7 h-7 stroke-[2]" />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-mono uppercase tracking-widest text-brand-yellow font-bold block">
                    The Culinary Standard
                  </span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
                    Authentic Craft.
                  </h3>
                </div>

                <p className="text-sm sm:text-base text-white/80 leading-relaxed font-sans">
                  No artificial bouillon shortcuts or reheated freezer meals. Every morning pot begins with slow-reduced tomato plum stews, garlic, ginger, and local habanero peppers. From the distinct smoky baseline of our signature Jollof to our house-steeped hibiscus Sobolo infused with cloves and pineapple, every flavor profile is crafted with care.
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex flex-wrap gap-2 text-xs font-mono text-white/70">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  Small-Batch Cooking
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  Local Ghanaian Aromatics
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  House-Brewed Sobolo
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CORE BRAND PILLARS (FROSTED-GLASS 3-COLUMN ROW)                        */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FAF5EE] py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-brand-cream-dark">
        <div className="max-w-6xl mx-auto space-y-14">
          <div className="max-w-2xl mx-auto text-center space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-brand-red font-bold">
              Core Principles
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-brand-dark">
              What Sets Us Apart.
            </h2>
            <p className="text-sm sm:text-base text-brand-muted max-w-lg mx-auto leading-relaxed">
              Three foundational commitments that guide every morning cooking session and every digital dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {/* Pillar 1 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-brand-cream-dark/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Clock className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">
                  Pillar 01
                </span>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-brand-dark">
                  Student-Centric Reliability
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  Engineered specifically around the university and office work schedule. Orders lock at {ORDERING_HOURS_DISPLAY.sameDayCutoff} sharp so lunch dispatch reliably arrives starting at {ORDERING_HOURS_DISPLAY.firstDeliverySlot} between class periods.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-brand-cream-dark/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Banknote className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">
                  Pillar 02
                </span>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-brand-dark">
                  Transparent Pricing
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  What you see is what you pay. Food is secured online via Hubtel MoMo before cooking begins, and the delivery fee is paid directly to the courier on arrival. Zero disguised markups or hidden convenience fees.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-brand-cream-dark/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 text-brand-red flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Flame className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-brand-red">
                  Pillar 03
                </span>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl uppercase tracking-tight text-brand-dark">
                  Uncompromising Quality
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  No shortcuts in the kitchen. From generous base portions and tender protein pairings to authentic Ghanaian spice profiles, each batch is cooked with the same care as home dining.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CLOSING EDITORIAL CTA                                                  */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FAF5EE] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-3xl p-8 sm:p-12 md:p-16 bg-brand-red text-white text-center space-y-6 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-yellow/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/30 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-brand-yellow font-bold block">
              Experience The Standard
            </span>
            <h2 className="font-display font-black text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              Ready for Lunch?
            </h2>
            <p className="text-sm sm:text-base text-white/85 leading-relaxed font-sans">
              Browse today&apos;s small-batch selection, customize your proteins, and lock in your order before the {ORDERING_HOURS_DISPLAY.sameDayCutoff} cutoff.
            </p>
          </div>

          <div className="relative z-10 pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/menu"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 sm:px-10 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-sm uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>View Today&apos;s Menu</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>

            <Link
              href="/delivery"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-extrabold text-sm uppercase tracking-wider transition-colors cursor-pointer"
            >
              <span>See Delivery Zones</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
