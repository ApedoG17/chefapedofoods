"use client";

import React from "react";
import Link from "next/link";
import { EXCLUDED_DELIVERY_AREAS, ORDERING_HOURS } from "@/config/business";
import { Bike, ShieldCheck, Clock, ArrowRight, CheckCircle2 } from "lucide-react";

export function DeliveryCoverageSection() {
  const zones = [
    { name: "Zone A", areas: "East Legon, Shiashie", fee: "GH₵10.00", eta: "25–35 mins" },
    { name: "Zone B", areas: "Osu, Cantonments, Labone", fee: "GH₵15.00", eta: "35–45 mins" },
    { name: "Zone C", areas: "Spintex, Batsonaa", fee: "GH₵20.00", eta: "40–50 mins" },
  ];

  return (
    <section className="w-full bg-brand-cream text-brand-dark py-16 sm:py-24 border-t border-brand-cream-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-brand-red">
            Accra Dispatch Coverage
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-brand-dark">
            Fast, Hot Midday Delivery.
          </h2>
          <p className="text-sm sm:text-base text-brand-muted max-w-lg mx-auto">
            Order before <strong className="text-brand-red">{ORDERING_HOURS.sameDayCutoff} GMT</strong> for same-day delivery right to your desk or home.
          </p>
        </div>

        {/* Dual Visual Feature Blocks (Matching Reference Image 2 Bottom Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Block: Warm Buff / Sand Card with Rider Dispatch (7 Cols) */}
          <div className="lg:col-span-7 bg-[#EFE5D5] rounded-3xl p-6 sm:p-10 shadow-card-depth flex flex-col justify-between border border-black/5">
            <div>
              <div className="flex items-center gap-3 text-brand-red mb-3">
                <Bike className="w-6 h-6 stroke-[2.5]" />
                <span className="text-xs font-black uppercase tracking-wider">
                  Dedicated Courier Dispatch
                </span>
              </div>

              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark uppercase tracking-tight mb-4">
                Delivered On Time In Accra
              </h3>

              <p className="text-xs sm:text-sm text-brand-dark/80 mb-6 leading-relaxed">
                Our kitchen organizes dedicated lunchtime dispatch routes every weekday from 11:30 AM to 2:30 PM.
              </p>

              {/* Zone Fee Matrix */}
              <div className="space-y-3 mb-8">
                {zones.map((zone) => (
                  <div
                    key={zone.name}
                    className="flex items-center justify-between p-3.5 bg-white/80 rounded-xl border border-black/5"
                  >
                    <div>
                      <span className="text-xs font-black uppercase text-brand-red mr-2">
                        {zone.name}:
                      </span>
                      <span className="text-xs font-bold text-brand-dark">{zone.areas}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-display font-extrabold text-brand-dark text-sm sm:text-base">
                        {zone.fee}
                      </span>
                      <span className="block text-[10px] text-brand-muted">to rider</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Excluded Areas Note */}
              <div className="text-xs text-brand-muted pb-4">
                <span className="font-bold text-brand-dark">Note:</span> We currently do not serve{" "}
                {EXCLUDED_DELIVERY_AREAS.join(", ")} to ensure food arrives hot.
              </div>
            </div>

            <Link
              href="/delivery-info"
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-button-red"
            >
              <span>View Full Delivery Policy</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>

          {/* Right Block: Deep Red Vertical Card with Payment Transparency (5 Cols) */}
          <div className="lg:col-span-5 bg-brand-red text-white rounded-3xl p-6 sm:p-10 shadow-card-depth flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-black/20 text-brand-yellow px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Surprise Fees</span>
              </div>

              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight leading-tight">
                Two-Part <br />
                Payment Split
              </h3>

              <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                To guarantee your food is cooked fresh without no-show waste, our ordering follows a clear two-part model:
              </p>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-brand-yellow">
                    <span>1. Food Subtotal</span>
                    <span>Prepaid</span>
                  </div>
                  <p className="text-xs text-white/80">
                    Paid upfront securely via Paystack (MTN MoMo, Telecel Cash, or Card).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/20 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between text-xs font-black uppercase text-brand-yellow">
                    <span>2. Delivery Fee</span>
                    <span>Pay Rider</span>
                  </div>
                  <p className="text-xs text-white/80">
                    Paid directly to your dispatch courier in cash or MoMo upon delivery.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <Link
                href="/menu"
                className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-button-yellow"
              >
                <span>Order Lunch Now</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
