import React from "react";
import Link from "next/link";
import { EXCLUDED_DELIVERY_AREAS, ORDERING_HOURS } from "@/config/business";
import { MapPin, Clock, Bike, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

export function DeliveryCoverageSection() {
  const sampleZones = [
    {
      name: "Zone A",
      areas: "East Legon, Shiashie",
      fee: "GH₵10",
      time: "25–35 mins",
    },
    {
      name: "Zone B",
      areas: "Osu, Cantonments, Labone",
      fee: "GH₵15",
      time: "35–45 mins",
    },
    {
      name: "Zone C",
      areas: "Spintex, Batsonaa",
      fee: "GH₵20",
      time: "40–50 mins",
    },
  ];

  return (
    <section className="w-full bg-brand-espresso text-ink py-20 sm:py-28 relative overflow-hidden border-t border-line/40">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/3 w-[450px] h-[450px] bg-brand-gold/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface2 border border-brand-gold/30 text-brand-gold text-xs font-bold tracking-widest uppercase mb-3">
            <Bike className="w-3.5 h-3.5" />
            <span>Accra Dispatch</span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight leading-tight mb-4">
            Hot food across Accra.
          </h2>
          <p className="text-base text-ink-dim leading-relaxed">
            We deliver on dedicated dispatch routes every lunchtime. Order before{" "}
            <strong className="text-brand-gold">{ORDERING_HOURS.sameDayCutoff} GMT</strong> for same-day hot lunch delivery.
          </p>
        </div>

        {/* 3 Zone Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {sampleZones.map((zone, idx) => (
            <div
              key={idx}
              className="bg-surface2/60 border border-line rounded-3xl p-6 sm:p-8 flex flex-col justify-between hover:border-brand-gold/40 transition-colors shadow-lg"
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs uppercase font-bold tracking-widest text-brand-gold">
                    {zone.name}
                  </span>
                  <span className="font-serif font-black text-xl text-ink">
                    {zone.fee}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-ink mb-2">
                  {zone.areas}
                </h3>
                <p className="text-xs text-ink-dim flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Target dispatch: {zone.time}</span>
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-line/60 flex items-center gap-2 text-[11px] text-ink-dim">
                <CheckCircle2 className="w-3.5 h-3.5 text-ok flex-none" />
                <span>Rider fee collected upon delivery</span>
              </div>
            </div>
          ))}
        </div>

        {/* Transparent Split Payment Guarantee & Excluded Areas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Split Payment Banner - 7 Cols */}
          <div className="lg:col-span-7 bg-brand-gold/10 border border-brand-gold/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-2">
                <span>The Two-Part Payment System</span>
              </div>
              <h4 className="font-serif font-bold text-xl text-ink">
                Food Online · Delivery to Rider
              </h4>
              <p className="text-xs sm:text-sm text-ink-dim leading-relaxed">
                To guarantee your meal is cooked fresh without no-show waste, food
                subtotals are paid upfront via Paystack. Delivery fees are paid directly
                to the motorbike dispatch rider when your food arrives.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-brand-gold/20 text-xs">
              <span className="text-brand-gold font-medium">✓ MTN MoMo & Telecel</span>
              <span className="text-brand-gold font-medium">✓ Ghana Debit/Credit Cards</span>
              <span className="text-brand-gold font-medium">✓ Cash or MoMo to Rider</span>
            </div>
          </div>

          {/* Excluded Areas Card - 5 Cols */}
          <div className="lg:col-span-5 bg-warn/10 border border-warn/30 rounded-3xl p-6 sm:p-8 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-warn flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                <span>Quality Distance Limit</span>
              </div>
              <h4 className="font-serif font-bold text-xl text-ink">
                Outside Coverage Areas
              </h4>
              <p className="text-xs text-ink-dim leading-relaxed">
                To keep food piping hot and avoid long bike transit degradation, we
                currently exclude outer zones:
              </p>
              <div className="text-xs font-medium text-warn/90 pt-1">
                {EXCLUDED_DELIVERY_AREAS.join(" · ")}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-warn/20">
              <Link
                href="/delivery-info"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-ink hover:text-brand-gold transition-colors"
              >
                <span>Read Full Delivery & Cancellation Policies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
