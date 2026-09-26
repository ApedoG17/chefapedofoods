"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MEAL_SIZES, INCLUDED_PROTEIN_OPTIONS, EXTRA_PROTEIN_PESEWAS } from "@/config/business";
import { formatGHS } from "@/lib/pricing";
import { Check, ArrowRight, Utensils, Plus, Sparkles } from "lucide-react";

type SizeKey = keyof typeof MEAL_SIZES;

export function BuildYourPlateSection() {
  const [activeSize, setActiveSize] = useState<SizeKey>("medium");

  const sizeInfo = MEAL_SIZES[activeSize];
  const includedProteins = INCLUDED_PROTEIN_OPTIONS[activeSize];

  return (
    <section className="w-full bg-brand-yellow text-brand-espresso py-20 sm:py-28 relative overflow-hidden">
      {/* Decorative background shape */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-yellow-dark/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-espresso text-brand-gold text-xs font-bold tracking-widest uppercase mb-3">
            <Utensils className="w-3.5 h-3.5" />
            <span>Interactive Customization</span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-brand-espresso tracking-tight leading-tight mb-4">
            How your plate comes together.
          </h2>
          <p className="text-base text-brand-espresso/80 leading-relaxed">
            Every meal size includes premium proteins at no extra cost. Select a
            size below to see exactly what comes with your order:
          </p>
        </div>

        {/* Size Selection Tabs */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 mb-8 max-w-2xl">
          {(Object.keys(MEAL_SIZES) as SizeKey[]).map((sizeKey) => {
            const size = MEAL_SIZES[sizeKey];
            const isSelected = activeSize === sizeKey;
            return (
              <button
                key={sizeKey}
                onClick={() => setActiveSize(sizeKey)}
                className={`py-4 px-3 sm:px-6 rounded-2xl sm:rounded-3xl text-center transition-all duration-200 border-2 ${
                  isSelected
                    ? "bg-brand-espresso text-ink border-brand-espresso shadow-xl scale-[1.03]"
                    : "bg-brand-yellow-light/60 text-brand-espresso border-brand-espresso/15 hover:bg-white/40"
                }`}
              >
                <div
                  className={`text-xs uppercase font-bold tracking-wider mb-1 ${
                    isSelected ? "text-brand-gold" : "text-brand-espresso/70"
                  }`}
                >
                  {size.label}
                </div>
                <div className="font-serif font-black text-xl sm:text-2xl">
                  {formatGHS(size.basePesewas)}
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Breakdown Card */}
        <div className="bg-brand-cream-light rounded-3xl p-6 sm:p-10 border border-brand-espresso/10 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: What's included in this size */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-brand-red mb-1">
                Included with {sizeInfo.label} Size
              </div>
              <h3 className="font-serif font-black text-2xl sm:text-3xl text-brand-espresso">
                Choose 1 of these included protein packages:
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {includedProteins.map((proteinName, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-brand-espresso/10 shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-espresso flex-none">
                    <Check className="w-4 h-4 text-brand-espresso font-bold" />
                  </div>
                  <span className="font-medium text-xs sm:text-sm text-brand-espresso">
                    {proteinName}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-ink-dim-light italic">
              All included protein packages are covered in the base price of{" "}
              {formatGHS(sizeInfo.basePesewas)}.
            </p>
          </div>

          {/* Right Column: Optional extra proteins */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-brand-espresso/10 space-y-5">
            <div className="flex items-center justify-between border-b border-brand-espresso/10 pb-3">
              <div>
                <div className="font-serif font-bold text-lg text-brand-espresso">
                  Extra Protein Add-ons
                </div>
                <div className="text-[11px] text-ink-dim-light">
                  Want more meat? Add extras at checkout:
                </div>
              </div>
              <Plus className="w-5 h-5 text-brand-red" />
            </div>

            <div className="space-y-2.5">
              {(Object.keys(EXTRA_PROTEIN_PESEWAS) as (keyof typeof EXTRA_PROTEIN_PESEWAS)[]).map(
                (extraKey) => (
                  <div
                    key={extraKey}
                    className="flex justify-between items-center text-xs sm:text-sm py-1.5 border-b border-brand-espresso/5"
                  >
                    <span className="font-medium capitalize text-brand-espresso">
                      Extra {extraKey}
                    </span>
                    <span className="font-serif font-bold text-brand-red">
                      +{formatGHS(EXTRA_PROTEIN_PESEWAS[extraKey])}
                    </span>
                  </div>
                )
              )}
            </div>

            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-brand-espresso text-brand-gold font-bold text-sm hover:bg-brand-espresso-light transition-all shadow-md active:scale-95"
            >
              <span>Build Your Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
