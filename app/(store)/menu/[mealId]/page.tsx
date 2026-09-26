"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { OptionRow } from "@/components/ui/OptionRow";
import { ExtraProteinStepperRow } from "@/components/ui/ExtraProteinStepperRow";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { Button } from "@/components/ui/Button";
import {
  MEAL_SIZES,
  INCLUDED_PROTEIN_OPTIONS,
  EXTRA_PROTEIN_PESEWAS,
} from "@/config/business";
import {
  calculateFoodSubtotalPesewas,
  formatGHS,
} from "@/lib/pricing";
import { addToCart } from "@/lib/cart/store";
import { createClient } from "@/lib/supabase/client";
import { getMealMedia } from "@/lib/media/meals";
import { ArrowLeft, Check, Sparkles, Flame, Plus } from "lucide-react";

type SizeKey = keyof typeof MEAL_SIZES;
type ExtraKey = keyof typeof EXTRA_PROTEIN_PESEWAS;

export default function MealCustomizerPage() {
  const params = useParams();
  const router = useRouter();
  const mealId = (params?.mealId as string) || "";

  const [mealName, setMealName] = useState("Meal");
  const [mealDescription, setMealDescription] = useState("");
  const [dbMealId, setDbMealId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<SizeKey>("small");
  const [selectedProtein, setSelectedProtein] = useState<string>(
    INCLUDED_PROTEIN_OPTIONS.small[0] || "2 Sausages"
  );
  const [extras, setExtras] = useState<Record<ExtraKey, number>>({
    chicken: 0,
    sausage: 0,
    egg: 0,
    fish: 0,
  });

  // Fetch meal details from Supabase (or resolve friendly slug)
  useEffect(() => {
    async function loadMeal() {
      try {
        const supabase = createClient();
        let query = supabase.from("meals").select("id, name, description, available");

        // If mealId looks like a UUID, search by id; otherwise search by name match
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mealId);
        if (isUuid) {
          query = query.eq("id", mealId);
        } else {
          // Normalize slug: e.g. "jollof-rice" -> "Jollof Rice"
          const cleanName = mealId
            .split("-")
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
          query = query.ilike("name", `%${cleanName}%`);
        }

        const { data, error } = await query.limit(1).maybeSingle();

        if (data && !error) {
          setMealName(data.name);
          setMealDescription(data.description || "");
          setDbMealId(data.id);
        } else {
          // Fallback based on param
          const fallbackNames: Record<string, string> = {
            "jollof-rice": "Jollof Rice",
            "fried-rice": "Fried Rice",
            "plain-rice-and-stew": "Plain Rice & Stew",
          };
          setMealName(fallbackNames[mealId] || "Jollof Rice");
          setMealDescription("Authentic Ghanaian style dish prepared fresh to order.");
          setDbMealId(mealId);
        }
      } catch (err) {
        console.warn("Could not load meal from database:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMeal();
  }, [mealId]);

  // When size changes, automatically update included protein options and reset to the first option
  const handleSizeChange = (newSize: SizeKey) => {
    setSelectedSize(newSize);
    const availableProteins = INCLUDED_PROTEIN_OPTIONS[newSize];
    if (!availableProteins.includes(selectedProtein)) {
      setSelectedProtein(availableProteins[0] || "2 Sausages");
    }
  };

  const handleExtraIncrement = (key: ExtraKey) => {
    setExtras((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const handleExtraDecrement = (key: ExtraKey) => {
    setExtras((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) - 1),
    }));
  };

  // Compute live subtotal
  const totalPesewas = calculateFoodSubtotalPesewas(selectedSize, extras);

  const handleAddToCart = () => {
    const cartItem = {
      id: `${dbMealId || mealId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      mealId: dbMealId || mealId,
      mealName,
      size: selectedSize,
      sizeLabel: MEAL_SIZES[selectedSize].label,
      basePricePesewas: MEAL_SIZES[selectedSize].basePesewas,
      includedProteinPackageName: selectedProtein,
      extras: { ...extras },
      quantity: 1,
      itemSubtotalPesewas: totalPesewas,
    };

    addToCart(cartItem);
    router.push("/cart");
  };

  const media = getMealMedia(mealName || mealId);

  return (
    <main className="space-y-6 pb-24 max-w-3xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/menu"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-dim hover:text-brand-gold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Menu</span>
        </Link>
      </div>

      {/* Top Meal Photo Showcase with Real Food Image */}
      <div className="relative w-full h-[260px] sm:h-[320px] rounded-3xl overflow-hidden border border-line/60 shadow-2xl bg-surface">
        <Image
          src={media.image}
          alt={media.alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-espresso via-brand-espresso/30 to-transparent" />

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-3 py-1 rounded-full bg-brand-red text-white text-xs font-bold shadow-md uppercase tracking-wider flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>{media.accentBadge}</span>
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h1 className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-ink tracking-tight mb-1">
            {mealName}
          </h1>
          <p className="text-xs sm:text-sm text-brand-gold-soft font-medium">
            {media.tagline}
          </p>
        </div>
      </div>

      {mealDescription && (
        <p className="text-xs sm:text-sm text-ink-dim leading-relaxed px-1">
          {mealDescription}
        </p>
      )}

      {/* Step 1: Choose your size */}
      <div className="bg-surface2/80 border border-line rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Choose Portion Size</span>
          </div>
          <span className="text-[11px] text-ink-dim">Base price includes protein</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.keys(MEAL_SIZES) as SizeKey[]).map((sizeKey) => {
            const sizeData = MEAL_SIZES[sizeKey];
            const isSelected = selectedSize === sizeKey;
            return (
              <button
                key={sizeKey}
                type="button"
                onClick={() => handleSizeChange(sizeKey)}
                className={`p-4 rounded-2xl text-left border-2 transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-brand-gold/15 border-brand-gold shadow-md text-ink"
                    : "bg-surface border-line hover:border-brand-gold/30 text-ink-dim hover:text-ink"
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-serif font-bold text-base text-ink capitalize">
                    {sizeData.label}
                  </span>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-brand-gold flex items-center justify-center text-brand-espresso font-bold text-xs">
                      ✓
                    </div>
                  )}
                </div>
                <div className="font-serif font-black text-lg text-brand-gold">
                  {formatGHS(sizeData.basePesewas)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Included protein (Dynamically scoped to size) */}
      <div className="bg-surface2/80 border border-line rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            <span>2. Select Included Protein</span>
          </div>
          <span className="text-[11px] text-ok font-medium">No Extra Charge</span>
        </div>

        <div className="divide-y divide-line/60 bg-surface rounded-2xl border border-line overflow-hidden">
          {INCLUDED_PROTEIN_OPTIONS[selectedSize].map((proteinName) => (
            <OptionRow
              key={proteinName}
              label={proteinName}
              selected={selectedProtein === proteinName}
              onClick={() => setSelectedProtein(proteinName)}
            />
          ))}
        </div>
        <p className="text-[11px] text-ink-dim">
          Options adapt automatically based on your selected size ({MEAL_SIZES[selectedSize].label}).
        </p>
      </div>

      {/* Step 3: Add extra protein */}
      <div className="bg-surface2/80 border border-line rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-gold flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-brand-red" />
            <span>3. Add Extra Meats & Sides (Optional)</span>
          </div>
        </div>

        <div className="divide-y divide-line/60 bg-surface rounded-2xl border border-line overflow-hidden">
          {(Object.keys(EXTRA_PROTEIN_PESEWAS) as ExtraKey[]).map((extraKey) => (
            <ExtraProteinStepperRow
              key={extraKey}
              name={extraKey.charAt(0).toUpperCase() + extraKey.slice(1)}
              priceFormatted={formatGHS(EXTRA_PROTEIN_PESEWAS[extraKey])}
              quantity={extras[extraKey] || 0}
              onIncrement={() => handleExtraIncrement(extraKey)}
              onDecrement={() => handleExtraDecrement(extraKey)}
            />
          ))}
        </div>
      </div>

      {/* Sticky CTA with dynamic subtotal */}
      <StickyCTA>
        <div className="max-w-3xl mx-auto w-full">
          <Button
            variant="primary"
            className="w-full shadow-gold-glow py-4 text-base font-bold flex items-center justify-center gap-2"
            onClick={handleAddToCart}
            disabled={loading}
          >
            <span>Add to Cart</span>
            <span>•</span>
            <span className="font-black">{formatGHS(totalPesewas)}</span>
          </Button>
        </div>
      </StickyCTA>
    </main>
  );
}
