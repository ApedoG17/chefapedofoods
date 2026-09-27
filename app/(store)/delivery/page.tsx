import React from "react";
import Link from "next/link";
import {
  ORDERING_HOURS,
  EXCLUDED_DELIVERY_AREAS,
  DELIVERY_FEE_STARTING_PESEWAS,
  CANCELLATION_WINDOW_MINUTES,
} from "@/config/business";
import { formatGHS } from "@/lib/pricing";
import {
  Clock,
  Bike,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Banknote,
  ArrowRight,
  Flame,
  CheckCircle2,
} from "lucide-react";

export const metadata = {
  title: "Delivery & Accra Coverage · Chef Apedo Foods",
  description:
    "Accra midday food delivery coverage, dispatch schedules, excluded delivery zones, and transparent split-payment policy.",
};

export default function DeliveryPage() {
  const startingFeeGHS = formatGHS(DELIVERY_FEE_STARTING_PESEWAS);

  return (
    <div className="w-full min-h-screen bg-brand-cream text-brand-dark flex flex-col relative selection:bg-brand-yellow selection:text-brand-dark">
      {/* ========================================================================= */}
      {/* 1. EDITORIAL DELIVERY HERO                                               */}
      {/* ========================================================================= */}
      <section className="w-full bg-brand-red text-white pt-10 sm:pt-14 pb-16 sm:pb-20 border-b border-black/10 relative overflow-hidden">
        {/* Subtle geometric lighting accents */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl space-y-4 text-left">
            <div className="inline-flex items-center gap-2 bg-black/25 text-brand-yellow px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-white/10">
              <Clock className="w-3.5 h-3.5" />
              <span>Same-Day Cutoff: {ORDERING_HOURS.sameDayCutoff} GMT</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-6xl lg:text-[4.5rem] uppercase tracking-tight leading-[1.02] text-white">
              Delivered Across Accra.
            </h1>

            <p className="text-sm sm:text-base text-white/90 max-w-xl leading-relaxed font-sans font-normal">
              Every weekday, our kitchen coordinates dedicated lunchtime dispatch routes. Meals are simmered fresh each morning and delivered hot directly to your office desk or home.
            </p>

            {/* Quick Factual Operational Indicators */}
            <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-white/80 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-yellow" />
                <span>Ordering: {ORDERING_HOURS.opensAt} – {ORDERING_HOURS.closesAt} GMT</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-brand-yellow" />
                <span>First Delivery Slot: {ORDERING_HOURS.firstDeliverySlot} GMT</span>
              </span>
              <span>·</span>
              <span>Rider fee from {startingFeeGHS} on delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. COVERAGE & STYLIZED ACCRA DISPATCH MAP                                */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FAF5EE] text-brand-dark py-14 sm:py-20 border-b border-brand-cream-dark">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-cream-dark pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
                Section 01 · Service Boundaries
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-brand-dark mt-1">
                Accra Dispatch Map
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-muted max-w-sm">
              Delivery fees start from {startingFeeGHS} and are determined by your selected zone during checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Stylized Visual Representation of Accra (Clearly Decorative Schematic) */}
            <div className="lg:col-span-7 bg-[#EFE5D5] rounded-3xl p-6 sm:p-8 border border-black/5 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-brand-red">
                  <Bike className="w-4 h-4 stroke-[2.5]" />
                  <span>Central Accra Dispatch Schematic</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/5 px-2.5 py-1 rounded-full text-brand-muted">
                  Illustrative Layout
                </span>
              </div>

              {/* Decorative Vector Schematic of Key Accra Corridors */}
              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] bg-[#E5D9C5] rounded-2xl p-6 overflow-hidden border border-black/5 flex flex-col justify-between">
                {/* Stylized road network grid lines */}
                <div className="absolute inset-0 opacity-15 pointer-events-none">
                  <div className="w-full h-full border-t border-b border-black/30 my-6" />
                  <div className="w-full h-full border-l border-r border-black/30 mx-12 -mt-12" />
                </div>

                {/* Corridor Anchor Nodes */}
                <div className="relative z-10 flex justify-between items-start">
                  <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl shadow-xs border border-black/5 text-left">
                    <span className="block text-[9px] font-black text-brand-red uppercase tracking-wider">Northern Hub</span>
                    <span className="font-display font-black text-xs text-brand-dark uppercase">Legon &amp; Shiashie</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl shadow-xs border border-black/5 text-right">
                    <span className="block text-[9px] font-black text-brand-red uppercase tracking-wider">Eastern Corridor</span>
                    <span className="font-display font-black text-xs text-brand-dark uppercase">Spintex &amp; Batsonaa</span>
                  </div>
                </div>

                {/* Center Kitchen Hub */}
                <div className="relative z-10 self-center text-center my-2">
                  <div className="inline-flex items-center gap-2 bg-brand-red text-white px-4 py-2.5 rounded-full shadow-md border-2 border-white">
                    <Flame className="w-4 h-4 text-brand-yellow" />
                    <span className="font-display font-black text-xs uppercase tracking-wider">
                      Chef Apedo Kitchen
                    </span>
                  </div>
                  <span className="block text-[10px] text-brand-muted font-bold mt-1 uppercase tracking-wider">
                    Morning Batch Dispatch Origin
                  </span>
                </div>

                {/* Southern Nodes */}
                <div className="relative z-10 flex justify-between items-end">
                  <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl shadow-xs border border-black/5 text-left">
                    <span className="block text-[9px] font-black text-brand-red uppercase tracking-wider">Central Hub</span>
                    <span className="font-display font-black text-xs text-brand-dark uppercase">Airport &amp; Dzorwulu</span>
                  </div>
                  <div className="bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl shadow-xs border border-black/5 text-right">
                    <span className="block text-[9px] font-black text-brand-red uppercase tracking-wider">Coastal Hub</span>
                    <span className="font-display font-black text-xs text-brand-dark uppercase">Osu, Labone &amp; Cantonments</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-brand-muted leading-relaxed">
                * Note: This graphic illustrates major dispatch corridors. Actual delivery feasibility and zone rates are computed automatically from your street address during checkout.
              </p>
            </div>

            {/* Excluded Areas Card (Strictly Enforcing Business Rules) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-cream-dark shadow-xs space-y-5">
                <div className="flex items-center gap-2 text-brand-red">
                  <AlertCircle className="w-5 h-5 stroke-[2.5]" />
                  <h3 className="font-display font-extrabold text-lg uppercase tracking-tight text-brand-dark">
                    Excluded Delivery Areas
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                  To ensure meals arrive at optimal eating temperature and avoid prolonged transit times, we do not deliver to the following 7 outer localities:
                </p>

                {/* Excluded Area Pills */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {EXCLUDED_DELIVERY_AREAS.map((area) => (
                    <span
                      key={area}
                      className="px-3.5 py-1.5 rounded-full bg-brand-red/10 text-brand-red text-xs font-black uppercase tracking-wider border border-brand-red/20"
                    >
                      ✕ {area}
                    </span>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-brand-cream border border-brand-cream-dark text-xs text-brand-dark/80 space-y-1">
                  <span className="font-bold text-brand-dark block">Service Boundary Principle:</span>
                  <p className="leading-relaxed">
                    Orders entered for these 7 zones are automatically blocked during checkout to prevent cold food deliveries.
                  </p>
                </div>
              </div>

              {/* Delivery Zone Economics Notice */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-cream-dark shadow-xs space-y-3">
                <h4 className="font-display font-extrabold text-sm uppercase tracking-tight text-brand-dark">
                  Zone Fee Structure
                </h4>
                <p className="text-xs text-brand-muted leading-relaxed">
                  Delivery fees start from <strong className="text-brand-dark font-bold">{startingFeeGHS}</strong>. Exact per-zone delivery fees are calculated from our dispatch configuration when you select your address at checkout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. THE SPLIT-PAYMENT PROTOCOL SECTION                                     */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#18110E] text-white py-16 sm:py-24 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-yellow">
                Section 02 · Payment Transparency
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white mt-1">
                The Split-Payment Protocol
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/70 max-w-sm">
              We never combine online food charges and rider delivery fees into a single confusing total.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Part 1: Food Total */}
            <div className="bg-white/5 rounded-3xl p-6 sm:p-8 border border-white/15 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow/15 text-brand-yellow flex items-center justify-center">
                  <CreditCard className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow">
                    Part 01 · Online Checkout
                  </span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
                    Food Total
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  Your meal portion, included protein packages, and any extra additions are paid online during checkout via Paystack.
                </p>

                <div className="space-y-2 pt-2 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    <span>Paid online before kitchen preparation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    <span>Supports MTN MoMo, Telecel Cash, and bank cards</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    <span>Instant confirmation upon successful payment</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-brand-yellow font-bold uppercase tracking-wider text-center">
                Prepaid to Chef Apedo Foods
              </div>
            </div>

            {/* Part 2: Delivery Fee */}
            <div className="bg-brand-red/20 rounded-3xl p-6 sm:p-8 border border-brand-red/40 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-yellow text-brand-dark flex items-center justify-center">
                  <Banknote className="w-6 h-6 stroke-[2.5]" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow">
                    Part 02 · Upon Arrival
                  </span>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl uppercase tracking-tight text-white">
                    Rider Delivery Fee
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                  The delivery fee (starting from {startingFeeGHS}) is paid directly to the motorcycle courier when your food arrives.
                </p>

                <div className="space-y-2 pt-2 text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    <span>100% of the delivery fee goes directly to your rider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    <span>Payable in cash or direct MoMo transfer to rider</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-yellow flex-shrink-0" />
                    <span>Displayed transparently before payment</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-brand-yellow text-brand-dark text-[11px] font-black uppercase tracking-wider text-center">
                Paid to Rider on Delivery
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ORDERING SCHEDULE & CANCELLATION RULES                                 */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#FAF5EE] text-brand-dark py-14 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl mx-auto text-center space-y-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
              Daily Operations
            </span>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight text-brand-dark">
              Daily Service Timings
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark shadow-xs space-y-2 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                Order Window Opens
              </span>
              <div className="font-display font-black text-2xl text-brand-dark">
                {ORDERING_HOURS.opensAt} GMT
              </div>
              <p className="text-xs text-brand-muted">Kitchen accepts lunch orders for the daily service.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-red/30 shadow-xs space-y-2 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-red">
                Same-Day Cutoff
              </span>
              <div className="font-display font-black text-2xl text-brand-red">
                {ORDERING_HOURS.sameDayCutoff} GMT
              </div>
              <p className="text-xs text-brand-muted">Same-day cooking schedule locks to prepare fresh batches.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-cream-dark shadow-xs space-y-2 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
                First Dispatch Slot
              </span>
              <div className="font-display font-black text-2xl text-brand-dark">
                {ORDERING_HOURS.firstDeliverySlot} GMT
              </div>
              <p className="text-xs text-brand-muted">Riders collect sealed orders for midday delivery.</p>
            </div>
          </div>

          {/* Cancellation Notice */}
          <div className="max-w-2xl mx-auto p-5 rounded-2xl bg-white border border-brand-cream-dark text-xs text-brand-muted text-center space-y-1">
            <span className="font-bold text-brand-dark">Cancellation Window:</span> Orders may be cancelled up to {CANCELLATION_WINDOW_MINUTES} minutes before your selected delivery slot. Because our food is prepared fresh daily in limited batches, cancellations are not permitted once cooking is underway.
          </div>

          {/* Bottom Action CTA */}
          <div className="text-center pt-4">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-3 px-10 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-sm uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5"
            >
              <span>Explore The Menu</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
