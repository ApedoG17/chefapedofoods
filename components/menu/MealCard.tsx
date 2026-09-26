"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getMealMedia } from "@/lib/media/meals";
import { ArrowRight } from "lucide-react";

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
    <div className="bg-brand-espresso-surface border border-white/8 rounded-2xl overflow-hidden shadow-warm-sm hover:border-brand-gold/30 transition-all duration-300 flex flex-col justify-between group">
      {/* Meal Image */}
      <div className="relative w-full h-[200px] sm:h-[230px] overflow-hidden bg-brand-espresso">
        <Image
          src={resolvedImage}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/20 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3">
          {media.accentBadge && (
            <span className="px-2.5 py-0.5 rounded-full bg-brand-espresso/80 backdrop-blur-sm border border-line text-[10.5px] font-medium text-brand-gold uppercase tracking-wider">
              {media.accentBadge}
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <Badge variant={available ? "ok" : "warn"}>
            {available ? "In Stock" : "Sold out"}
          </Badge>
        </div>

        {/* Bottom Title on Image */}
        <div className="absolute bottom-3 left-4 right-4">
          <h3 className="font-serif font-medium text-xl text-ink-dark">
            {name}
          </h3>
          <p className="text-xs text-brand-gold-soft font-light truncate">
            {media.tagline}
          </p>
        </div>
      </div>

      {/* Meal Body */}
      <div className="p-5 flex flex-col justify-between flex-1 gap-4">
        <p className="text-xs text-ink-dim leading-relaxed line-clamp-2 font-light">
          {description || media.description}
        </p>

        <div className="pt-3 border-t border-line/50 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-ink-dim font-medium">
              From
            </div>
            <div className="font-serif text-lg text-brand-gold font-normal">
              {startingPrice.replace("From ", "")}
            </div>
          </div>

          {available ? (
            <Link href={`/menu/${id}`}>
              <Button variant="primary" size="sm" className="gap-1.5 shadow-warm-sm">
                <span>Customize</span>
                <ArrowRight className="w-3.5 h-3.5 opacity-80" />
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
