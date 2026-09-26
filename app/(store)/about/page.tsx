import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Flame, CheckCircle2, Terminal, UtensilsCrossed, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "About · The Story Behind Chef Apedo Foods",
  description:
    "How Computer Science student Godwin Apedo founded Chef Apedo Foods to bring authentic, reliable Ghanaian midday meals to Accra.",
};

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-brand-cream text-brand-dark flex flex-col relative selection:bg-brand-yellow selection:text-brand-dark">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <section className="w-full bg-brand-red text-white pt-10 sm:pt-14 pb-14 sm:pb-18 border-b border-black/10 relative overflow-hidden">
        {/* Ambient lighting accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 bg-black/25 text-brand-yellow px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-white/10">
              <Terminal className="w-3.5 h-3.5" />
              <span>Founder Story · Accra, Ghana</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[4.5rem] uppercase tracking-tight leading-[1.02] text-white">
              Code &amp; Cooking.
            </h1>

            <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed font-sans font-normal">
              Balancing computer science coursework at the University of Ghana and early morning kitchen preps to build a dependable, direct-to-customer food service for Accra.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. THE FOUNDER NARRATIVE (ASYMMETRIC COMPOSITION)                          */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FAF5EE] text-brand-dark py-16 sm:py-24 border-b border-brand-cream-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Left Column: Editorial Image Placeholder (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative w-full aspect-[4/5] rounded-3xl bg-[#EFE5D5] border border-black/10 overflow-hidden shadow-xs flex flex-col justify-between p-6 sm:p-8">
                {/* Subtle technical crosshair grid markings */}
                <div className="absolute top-4 left-4 text-[10px] font-mono text-brand-muted uppercase">
                  + UG / CS / 2026
                </div>
                <div className="absolute top-4 right-4 text-[10px] font-mono text-brand-muted uppercase">
                  [ ARCHIVE ]
                </div>

                <div className="my-auto text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-brand-red/10 text-brand-red mx-auto flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 stroke-[2]" />
                  </div>
                  <div className="space-y-1">
                    <span className="font-display font-black text-lg sm:text-xl uppercase tracking-tight text-brand-dark block">
                      Godwin Apedo
                    </span>
                    <span className="text-xs text-brand-muted font-medium block">
                      Founder &amp; Developer · Chef Apedo Foods
                    </span>
                  </div>
                  <div className="pt-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/80 border border-black/5 text-[11px] font-bold text-brand-dark">
                      University of Ghana, Legon
                    </span>
                  </div>
                </div>

                <div className="border-t border-black/10 pt-3 flex items-center justify-between text-[10px] text-brand-muted font-mono uppercase tracking-wider">
                  <span>Independent Cloud Kitchen</span>
                  <span>Accra Service</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#EFE5D5]/60 border border-black/5 text-xs text-brand-muted leading-relaxed">
                * Note: Platform built independently using Next.js and Supabase alongside daily kitchen operations.
              </div>
            </div>

            {/* Right Column: Authentic Editorial Story (7 Cols) */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
                  Behind The Kitchen
                </span>
                <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-brand-dark mt-1">
                  Built From the Ground Up.
                </h2>
              </div>

              <div className="space-y-5 text-sm sm:text-base text-brand-dark/85 font-sans leading-relaxed">
                <p>
                  Chef Apedo Foods started with a simple observation on campus: getting a hot, genuinely home-cooked Ghanaian lunch during a busy workday or lecture schedule was surprisingly difficult. Most food delivery options were either fast food chains or fragmented WhatsApp ordering threads with uncertain wait times.
                </p>

                <p>
                  As a Computer Science student at the University of Ghana, Godwin Apedo decided to approach lunch service differently: merging technical precision with honest, small-batch cooking. Instead of operating through messy social media direct messages, he designed and programmed a structured web storefront to manage real inventory, set firm batch cutoffs, and give customers a clear order tracking experience.
                </p>

                <p>
                  Every morning begins early in the kitchen. Rice is slow-simmered in seasoned tomato bases, proteins are seasoned with real local aromatics, and batch sizes are deliberately capped at what can be prepared fresh for midday. When lecture hours begin, the platform locks same-day orders at 10:00 GMT so morning cooking transitions directly into packaging and dispatch.
                </p>

                <p>
                  Chef Apedo Foods is not a massive corporate ghost kitchen or a venture-backed franchise. It is an independent project built with discipline, code, and a deep appreciation for good food done properly.
                </p>
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex flex-wrap gap-4 items-center">
                <div className="px-4 py-2 rounded-xl bg-white border border-brand-cream-dark text-xs font-bold text-brand-dark">
                  📍 Operated in Accra, Ghana
                </div>
                <div className="px-4 py-2 rounded-xl bg-white border border-brand-cream-dark text-xs font-bold text-brand-dark">
                  🎓 Computer Science Undergraduate
                </div>
                <div className="px-4 py-2 rounded-xl bg-white border border-brand-cream-dark text-xs font-bold text-brand-dark">
                  🍳 Morning Batch Model
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. CORE VALUES (MINIMAL 3-COLUMN SECTION)                                 */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#18110E] text-white py-16 sm:py-24 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-yellow">
              Operating Principles
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white">
              What We Stand For.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1: Fresh Food */}
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/15 text-brand-yellow flex items-center justify-center">
                  <Flame className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow">
                  Principle 01
                </span>
                <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-white">
                  Fresh Food
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Cooked fresh each morning for that day&apos;s lunch window. We do not store pre-cooked batches in freezers or serve reheated food from previous days.
                </p>
              </div>
            </div>

            {/* Value 2: Clear Pricing */}
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/15 text-brand-yellow flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow">
                  Principle 02
                </span>
                <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-white">
                  Clear Pricing
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Transparent base meals, explicit protein portions, and separate rider delivery fees. What you see at checkout is exactly what is charged—no arbitrary surcharges.
                </p>
              </div>
            </div>

            {/* Value 3: Reliable Ordering */}
            <div className="bg-white/5 rounded-3xl p-8 border border-white/10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/15 text-brand-yellow flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow">
                  Principle 03
                </span>
                <h3 className="font-display font-extrabold text-2xl uppercase tracking-tight text-white">
                  Reliable Ordering
                </h3>
                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  A structured web system with strict ordering hours (6 AM – 5 PM) and a 10 AM same-day cutoff, ensuring every accepted order is properly cooked and dispatched on time.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-6">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-sm uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>View Today&apos;s Menu</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
