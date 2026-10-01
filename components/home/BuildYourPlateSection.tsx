"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MEAL_SIZES, INCLUDED_PROTEIN_OPTIONS, EXTRA_PROTEIN_PESEWAS } from "@/config/business";
import { formatGHS } from "@/lib/pricing";
import { Check, ArrowRight, Plus } from "lucide-react";

type SizeKey = keyof typeof MEAL_SIZES;

export function BuildYourPlateSection() {
  const [activeSize, setActiveSize] = useState<SizeKey>("medium");

  const sizeInfo = MEAL_SIZES[activeSize];
  const includedProteins = INCLUDED_PROTEIN_OPTIONS[activeSize];

  return (
    <section className="w-full bg-brand-yellow text-brand-dark py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="text-xs font-black uppercase tracking-[0.2em] text-brand-red">
            Portion Architecture
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight text-brand-dark">
            How Your Plate Comes Together.
          </h2>
          <p className="text-sm sm:text-base text-brand-dark/85 font-medium max-w-lg mx-auto">
            Every size comes with generous proteins included in the base price. Select your portion below:
          </p>
        </div>

        {/* Portion Size Tabs */}
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-10">
          {(Object.keys(MEAL_SIZES) as SizeKey[]).map((sizeKey) => {
            const size = MEAL_SIZES[sizeKey];
            const isSelected = activeSize === sizeKey;
            return (
              <button
                key={sizeKey}
                onClick={() => setActiveSize(sizeKey)}
                className={`px-3 py-2 text-xs sm:px-4 sm:py-3 sm:text-sm md:text-base rounded-full font-display uppercase tracking-wider font-extrabold transition-all duration-200 min-h-[44px] flex items-center justify-center ${
                  isSelected
                    ? "bg-brand-dark text-white shadow-lg scale-105"
                    : "bg-white/80 text-brand-dark hover:bg-white"
                }`}
              >
                <span>{size.label}</span>
                <span className="ml-2 text-brand-yellow font-black text-xs sm:text-sm md:text-base">
                  {formatGHS(size.basePesewas)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Breakdown Card Grid (Crisp white containers on vibrant yellow background) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Column: Included Proteins (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-card-depth border border-black/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-red">
                  Step 1: Choose Included Protein
                </span>
                <span className="bg-brand-cream text-brand-dark text-[11px] font-bold px-3 py-1 rounded-full">
                  Included in {formatGHS(sizeInfo.basePesewas)}
                </span>
              </div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark uppercase tracking-tight mb-2">
                Included with {sizeInfo.label}
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted mb-6">
                Pick 1 of the following protein packages to accompany your rice:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {includedProteins.map((proteinName, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-brand-cream border border-brand-cream-dark"
                  >
                    <div className="w-6 h-6 rounded-full bg-brand-red text-white flex items-center justify-center flex-none">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-brand-dark">
                      {proteinName}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-brand-muted italic">
              All included protein packages are cooked fresh with your meal and covered in the base price.
            </p>
          </div>

          {/* Right Column: Optional Extra Add-ons (5 Cols) */}
          <div className="lg:col-span-5 bg-brand-dark text-white rounded-3xl p-6 sm:p-8 shadow-card-depth flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-brand-yellow mb-2">
                Step 2: Add Extra Meats
              </div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mb-4">
                Extra Meats
              </h3>
              <p className="text-xs text-white/70 mb-6">
                Craving extra protein? Stack extra pieces onto any meal:
              </p>

              <div className="divide-y divide-white/10 mb-6">
                {(Object.keys(EXTRA_PROTEIN_PESEWAS) as (keyof typeof EXTRA_PROTEIN_PESEWAS)[]).map(
                  (extraKey) => (
                    <div
                      key={extraKey}
                      className="py-2.5 flex items-center justify-between text-xs sm:text-sm"
                    >
                      <span className="capitalize font-semibold text-white/90">
                        Extra {extraKey}
                      </span>
                      <span className="font-display font-extrabold text-brand-yellow">
                        +{formatGHS(EXTRA_PROTEIN_PESEWAS[extraKey])}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-button-yellow"
            >
              <span>Build Your Order Now</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
