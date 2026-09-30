"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ArrowRight, Sparkles } from "lucide-react";
import { getMealMedia } from "@/lib/media/meals";

export interface MealCardProps {
  id: string;
  name: string;
  description?: string | null;
  startingPrice: string; // e.g. "From GH₵45" or "GH₵45"
  available: boolean;
  imageUrl?: string | null;
  rating?: number;
  reviewCount?: number;
  onAddToCart?: () => void;
  className?: string;
}

/**
 * MealCard Component (Design B: Full-Bleed Imagery with Dark Gradient Overlay)
 * Positions star rating, title, description, price, and CTA cleanly over
 * a high-contrast dark gradient ensuring 100% legibility on any device.
 */
export function MealCard({
  id,
  name,
  description,
  startingPrice,
  available,
  imageUrl,
  rating = 4.9,
  reviewCount = 84,
  className = "",
}: MealCardProps) {
  const media = getMealMedia(imageUrl || name || id);
  const resolvedImage = imageUrl || media.image || "/images/meals/jollof-isolated.png";
  const formattedPrice = startingPrice.startsWith("From ") ? startingPrice : `From ${startingPrice}`;

  return (
    <div
      className={`group relative rounded-3xl overflow-hidden aspect-[3/4] sm:aspect-[4/5] md:aspect-[3/4] flex flex-col justify-between border border-white/10 shadow-xl hover:border-brand-yellow/40 hover:shadow-2xl transition-all duration-300 ${className}`}
    >
      {/* 1. Full-Bleed Meal Background Image */}
      <div className="absolute inset-0 -z-10 bg-[#18110E] overflow-hidden">
        <Image
          src={resolvedImage}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Subtle top vignette for badges */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent pointer-events-none" />
        {/* Deep bottom gradient overlay (Design B specification) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 via-45% to-transparent pointer-events-none" />
      </div>

      {/* 2. Top Bar (Badges & Availability) */}
      <div className="relative z-10 p-4 sm:p-5 flex items-center justify-between">
        <div>
          {media.accentBadge ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10.5px] font-bold text-brand-yellow uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 text-brand-yellow" />
              <span>{media.accentBadge}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[10.5px] font-bold text-brand-yellow uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3 h-3 text-brand-yellow" />
              <span>Chef's Choice</span>
            </span>
          )}
        </div>

        <div>
          <span
            className={`px-3 py-1 rounded-full text-[10.5px] font-black uppercase tracking-wider backdrop-blur-md border ${
              available
                ? "bg-green-500/20 text-green-300 border-green-500/30"
                : "bg-red-500/20 text-red-300 border-red-500/30"
            }`}
          >
            {available ? "In Stock" : "Sold Out"}
          </span>
        </div>
      </div>

      {/* 3. Bottom Content Over Dark Gradient */}
      <div className="relative z-10 p-5 sm:p-6 space-y-3 mt-auto">
        {/* Star Rating */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center text-brand-yellow">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow"
              />
            ))}
          </div>
          <span className="text-white font-bold text-xs">
            {rating.toFixed(1)}
          </span>
          <span className="text-white/60 text-[11px]">
            ({reviewCount})
          </span>
        </div>

        {/* Meal Title & Description */}
        <div className="space-y-1">
          <h3 className="font-display font-black text-xl sm:text-2xl text-white uppercase tracking-tight leading-tight group-hover:text-brand-yellow transition-colors">
            {name}
          </h3>
          <p className="text-xs text-white/75 font-normal line-clamp-2 leading-relaxed">
            {description || media.description || media.tagline}
          </p>
        </div>

        {/* Bottom Action Strip: Price + Add to Order */}
        <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/60 font-bold">
              {formattedPrice.startsWith("From ") ? "Starting At" : "Price"}
            </div>
            <div className="font-display font-black text-lg sm:text-xl text-brand-yellow">
              {formattedPrice.replace("From ", "")}
            </div>
          </div>

          {available ? (
            <Link
              href={`/menu/${id}`}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            >
              <span>Add to Order</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          ) : (
            <button
              disabled
              className="px-4 py-2.5 rounded-full bg-white/10 text-white/40 font-bold text-xs uppercase tracking-wider cursor-not-allowed"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
