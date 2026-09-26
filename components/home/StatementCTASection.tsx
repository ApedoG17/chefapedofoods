import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Clock, ShieldCheck } from "lucide-react";
import { ORDERING_HOURS } from "@/config/business";

export function StatementCTASection() {
  return (
    <section className="w-full bg-brand-espresso text-ink py-24 sm:py-32 relative overflow-hidden border-t border-line/40">
      {/* Dramatic atmospheric radial gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-gold/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-red/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface2 border border-brand-gold/30 text-brand-gold text-xs font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Fresh Lunch Every Afternoon</span>
        </div>

        {/* Massive Bold Statement */}
        <h2 className="font-serif font-black text-4xl sm:text-6xl md:text-7xl text-ink tracking-tight leading-[1.05]">
          YOUR CRAVING <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-gold via-brand-yellow to-brand-gold-soft">
            JUST GOT DELIVERED.
          </span>
        </h2>

        <p className="text-base sm:text-lg text-ink-dim max-w-2xl mx-auto leading-relaxed font-normal">
          Skip the bland takeout. Treat yourself and your team to genuine,
          fire-cooked Ghanaian meals prepared with passion and delivered hot.
        </p>

        {/* Action CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-9 py-4 rounded-full bg-brand-gold text-brand-espresso font-black text-base shadow-gold-glow hover:bg-brand-gold-soft hover:scale-[1.03] active:scale-95 transition-all duration-200"
          >
            <span>Order Today&apos;s Lunch</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-surface2/80 border border-line text-ink font-semibold text-base hover:bg-white/10 hover:border-brand-gold/40 transition-all duration-200"
          >
            <span>View Full Menu</span>
          </Link>
        </div>

        {/* Operational hours reminder */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-ink-dim border-t border-line/40 max-w-xl mx-auto">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-brand-gold" />
            <span>Cutoff at {ORDERING_HOURS.sameDayCutoff} GMT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-ok" />
            <span>Secure Paystack Checkout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-brand-yellow font-bold">GH₵10</span>
            <span>Rider Delivery From</span>
          </div>
        </div>
      </div>
    </section>
  );
}
