"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getMealMedia } from "@/lib/media/meals";
import { ArrowRight, Flame, Sparkles } from "lucide-react";

export interface MealCardProps {
  id: string;
  name: string;
  description?: string | null;
  startingPrice: string; // e.g. "From GH₵45"
  available: boolean;
  imageUrl?: string | null;
}

export function MealCard({
  id,
  name,
  description,
  startingPrice,
  available,
  imageUrl,
}: MealCardProps) {
  const media = getMealMedia(imageUrl || name || id);
  const resolvedImage = imageUrl || media.image;

  return (
    <div className="bg-surface2/80 border border-line rounded-3xl overflow-hidden shadow-lg hover:border-brand-gold/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group">
      {/* Meal Image */}
      <div className="relative w-full h-[220px] sm:h-[260px] overflow-hidden bg-brand-espresso">
        <Image
          src={resolvedImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso/80 via-brand-espresso/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {media.accentBadge && (
            <span className="px-3 py-1 rounded-full bg-brand-red text-white text-[11px] font-bold shadow-md uppercase tracking-wider flex items-center gap-1">
              <Flame className="w-3 h-3" />
              <span>{media.accentBadge}</span>
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant={available ? "ok" : "warn"}>
            {available ? "In Stock" : "Out of stock"}
          </Badge>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-ink tracking-tight">
            {name}
          </h3>
          <p className="text-xs text-brand-gold-soft font-medium truncate">
            {media.tagline}
          </p>
        </div>
      </div>

      {/* Meal Body */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 gap-4">
        <p className="text-xs sm:text-sm text-ink-dim leading-relaxed line-clamp-2">
          {description || media.description}
        </p>

        <div className="pt-3 border-t border-line/60 flex items-center justify-between">
          <div>
            <div className="text-[10.5px] uppercase tracking-wider text-ink-dim">
              Starting from
            </div>
            <div className="font-serif font-bold text-xl text-brand-gold">
              {startingPrice}
            </div>
          </div>

          {available ? (
            <Link href={`/menu/${id}`}>
              <Button variant="primary" size="sm" className="gap-1.5 shadow-md">
                <span>Customize</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <Button variant="disabled" size="sm">
              Unavailable
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
