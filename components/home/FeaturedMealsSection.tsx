"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Flame, Check } from "lucide-react";

export function FeaturedMealsSection() {
  return (
    <section
      id="menu-showcase"
      className="w-full bg-brand-cream text-ink-light py-20 sm:py-28 relative overflow-hidden"
    >
      {/* Background design accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-yellow/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-red/10 text-brand-red text-xs font-bold tracking-widest uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Today&apos;s Fresh Selection</span>
          </div>
          <h2 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-brand-espresso tracking-tight leading-tight mb-4">
            Pick your meal. <br />
            <span className="italic font-light text-brand-red">
              Make it yours.
            </span>
          </h2>
          <p className="text-base text-ink-dim-light leading-relaxed">
            All meals are prepared to order in small batches. Choose your size,
            select your included protein package, and add extra meats as you crave.
          </p>
        </div>

        {/* Asymmetrical Featured Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Card 1: Large Featured Hero Card (Jollof Rice) - 7 Cols */}
          <div className="lg:col-span-7 bg-brand-cream-light rounded-3xl overflow-hidden border border-brand-espresso/10 shadow-card-elevation flex flex-col justify-between group hover:shadow-2xl transition-all duration-300">
            {/* Top Photography with Badge Overlay */}
            <div className="relative w-full h-[280px] sm:h-[340px] overflow-hidden">
              <Image
                src="/images/meals/jollof-rice.jpg"
                alt="Chef Apedo Jollof Rice"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/70 via-transparent to-transparent opacity-80" />

              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3.5 py-1.5 rounded-full bg-brand-red text-white text-xs font-bold shadow-md uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Signature Dish
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-brand-yellow text-brand-espresso text-xs font-bold shadow-md uppercase tracking-wider">
                  Accra #1 Craving
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="font-serif font-bold text-2xl sm:text-3xl text-ink">
                  Smoky Jollof Rice
                </div>
                <div className="text-xs sm:text-sm text-brand-gold-soft font-medium">
                  Fire-simmered Ghanaian gold with deep spice aromatics
                </div>
              </div>
            </div>

            {/* Card Content & CTAs */}
            <div className="p-6 sm:p-8 flex flex-col justify-between flex-1 gap-6">
              <p className="text-sm text-ink-dim-light leading-relaxed">
                Ghanaian-style fragrant rice cooked in slow-simmered spiced tomato
                sauce with rich herbs and subtle firewood smoke. Accompanied by
                shito and fresh vegetables.
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-brand-espresso/10">
                <div>
                  <div className="text-xs uppercase tracking-wider text-ink-dim-light font-medium">
                    Starting from
                  </div>
                  <div className="font-serif font-black text-2xl text-brand-red">
                    GH₵45
                  </div>
                </div>

                <Link
                  href="/menu/jollof-rice"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-red hover:bg-brand-red-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
                >
                  <span>Customize Jollof</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column: Stacked Cards (Fried Rice & Plain Rice & Stew) - 5 Cols */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            {/* Card 2: Fried Rice */}
            <div className="bg-brand-cream-light rounded-3xl overflow-hidden border border-brand-espresso/10 shadow-card-elevation flex flex-col group hover:shadow-xl transition-all duration-300">
              <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden">
                <Image
                  src="/images/meals/fried-rice.jpg"
                  alt="Chef Apedo Fried Rice"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-brand-yellow text-brand-espresso text-xs font-bold shadow-sm uppercase tracking-wider">
                    Chef Specialty
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="font-serif font-bold text-xl text-ink">
                    Ghanaian Fried Rice
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
                <p className="text-xs sm:text-sm text-ink-dim-light line-clamp-2">
                  Wok-tossed seasoned rice with sweet carrots, green peas, scallions,
                  and authentic house-made shito.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-brand-espresso/10">
                  <span className="font-serif font-bold text-lg text-brand-espresso">
                    From GH₵45
                  </span>
                  <Link
                    href="/menu/fried-rice"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-espresso text-brand-gold font-bold text-xs hover:bg-brand-espresso-light transition-all active:scale-95"
                  >
                    <span>Customize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 3: Plain Rice & Stew */}
            <div className="bg-brand-cream-light rounded-3xl overflow-hidden border border-brand-espresso/10 shadow-card-elevation flex flex-col group hover:shadow-xl transition-all duration-300">
              <div className="relative w-full h-[180px] sm:h-[200px] overflow-hidden">
                <Image
                  src="/images/meals/plain-rice-and-stew.jpg"
                  alt="Chef Apedo Plain Rice & Stew"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/60 via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-brand-gold text-brand-espresso text-xs font-bold shadow-sm uppercase tracking-wider">
                    Comfort Classic
                  </span>
                </div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <div className="font-serif font-bold text-xl text-ink">
                    Plain Rice & Stew
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
                <p className="text-xs sm:text-sm text-ink-dim-light line-clamp-2">
                  Fluffy steamed jasmine rice served with rich, savory Ghanaian beef
                  and chicken stew slow-braised to tenderness.
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-brand-espresso/10">
                  <span className="font-serif font-bold text-lg text-brand-espresso">
                    From GH₵45
                  </span>
                  <Link
                    href="/menu/plain-rice-and-stew"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-espresso text-brand-gold font-bold text-xs hover:bg-brand-espresso-light transition-all active:scale-95"
                  >
                    <span>Customize</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Menu Anchor */}
        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 text-sm font-bold text-brand-red hover:text-brand-red-dark transition-colors border-b-2 border-brand-red/30 pb-1"
          >
            <span>View Full Menu & All Protein Package Combinations</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
