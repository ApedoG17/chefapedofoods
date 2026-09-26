import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, ShieldCheck } from "lucide-react";
import { ORDERING_HOURS } from "@/config/business";

export function StatementCTASection() {
  return (
    <section className="w-full bg-brand-red text-white py-20 sm:py-28 border-t border-white/10 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 bg-black/20 text-brand-yellow px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
          <Clock className="w-3.5 h-3.5" />
          <span>Accra Lunch Service · Orders Close at {ORDERING_HOURS.sameDayCutoff} GMT</span>
        </div>

        {/* Oversized High-Impact Headline */}
        <h2 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[4.25rem] text-white uppercase tracking-tight leading-[1.05]">
          Your Craving, <br />
          <span className="text-brand-yellow">Delivered Hot</span> To Your Desk.
        </h2>

        <p className="text-sm sm:text-base text-white/90 max-w-lg mx-auto leading-relaxed">
          Skip the bland takeout. Treat yourself to genuine, fire-cooked Ghanaian meals
          simmered in small morning batches and dispatched hot across Accra.
        </p>

        {/* High Energy CTA */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-sm sm:text-base uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow"
          >
            <span>Order Today&apos;s Lunch</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>

          <Link
            href="/menu"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-full bg-black/20 hover:bg-black/30 border border-white/20 text-white font-extrabold text-sm uppercase tracking-wider transition-colors"
          >
            <span>View Full Menu</span>
          </Link>
        </div>

        {/* Small trust footer */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-white/70 font-medium">
          <span>✓ Prepaid via Paystack</span>
          <span>✓ Dedicated rider delivery</span>
          <span>✓ Fresh daily batch</span>
        </div>
      </div>
    </section>
  );
}
