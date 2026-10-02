"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, CheckCircle, Plus, Minus, Sparkles } from "lucide-react";
import {
  MEAL_SIZES,
  INCLUDED_PROTEIN_OPTIONS,
  EXTRA_PROTEIN_PESEWAS,
} from "@/config/business";
import { formatGHS } from "@/lib/pricing";
import { addToCart, type CartItem } from "@/lib/cart/store";
import { createClient } from "@/lib/supabase/client";
import { getMealMedia } from "@/lib/media/meals";

type SizeKey = keyof typeof MEAL_SIZES;
type ExtraKey = keyof typeof EXTRA_PROTEIN_PESEWAS;

export default function MealCustomizerPage() {
  const params = useParams();
  const router = useRouter();
  const rawMealId = (params?.mealId as string) || "jollof-rice";

  const [mealName, setMealName] = useState("Jollof Rice");
  const [mealDescription, setMealDescription] = useState("");
  const [dbMealId, setDbMealId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Form selections
  const [selectedSize, setSelectedSize] = useState<SizeKey | null>("medium");
  const [selectedProtein, setSelectedProtein] = useState<string | null>(
    INCLUDED_PROTEIN_OPTIONS.medium[0] || "Chicken + Egg"
  );
  const [extras, setExtras] = useState<Record<ExtraKey, number>>({
    chicken: 0,
    sausage: 0,
    egg: 0,
    fish: 0,
  });

  // Parallax scroll state
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch meal details from Supabase with factual fallbacks
  useEffect(() => {
    async function loadMeal() {
      try {
        const supabase = createClient();
        let query = supabase.from("meals").select("id, name, description, available");

        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawMealId);
        if (isUuid) {
          query = query.eq("id", rawMealId);
        } else {
          const cleanName = rawMealId
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
          const fallbackNames: Record<string, { name: string; description: string }> = {
            "jollof-rice": {
              name: "Jollof Rice",
              description: "Ghanaian-style jollof rice prepared fresh daily.",
            },
            "fried-rice": {
              name: "Fried Rice",
              description: "Ghanaian-style fried rice.",
            },
            "plain-rice-and-stew": {
              name: "Plain Rice & Stew",
              description: "Plain rice served with stew.",
            },
          };
          const resolved = fallbackNames[rawMealId] || {
            name: "Jollof Rice",
            description: "Ghanaian-style jollof rice prepared fresh daily.",
          };
          setMealName(resolved.name);
          setMealDescription(resolved.description);
          setDbMealId(rawMealId);
        }
      } catch (err) {
        console.warn("Could not load meal:", err);
      } finally {
        setLoading(false);
      }
    }

    loadMeal();
  }, [rawMealId]);

  // Size switch handler: ensures protein matches size package rules
  const handleSizeSelect = (sizeKey: SizeKey) => {
    setSelectedSize(sizeKey);
    const available = INCLUDED_PROTEIN_OPTIONS[sizeKey];
    if (!selectedProtein || !available.includes(selectedProtein)) {
      setSelectedProtein(available[0] || null);
    }
  };

  // Extras stepper handlers
  const handleExtraIncrement = (key: ExtraKey) => {
    setExtras((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const handleExtraDecrement = (key: ExtraKey) => {
    setExtras((prev) => ({
      ...prev,
      [key]: Math.max(0, (prev[key] || 0) - 1),
    }));
  };

  // Authoritative subtotal calculation in pesewas
  const basePricePesewas = selectedSize ? MEAL_SIZES[selectedSize].basePesewas : 0;
  const extrasTotalPesewas = (Object.keys(extras) as ExtraKey[]).reduce((sum, key) => {
    return sum + (extras[key] || 0) * EXTRA_PROTEIN_PESEWAS[key];
  }, 0);
  const totalPesewas = basePricePesewas + extrasTotalPesewas;

  // Validation: Base size and protein must both be selected
  const isReadyToAddToCart = Boolean(selectedSize && selectedProtein);

  // Cart payload generation
  const handleAddToCart = () => {
    if (!isReadyToAddToCart || !selectedSize || !selectedProtein) return;

    const cartItemId = `${dbMealId || rawMealId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const extrasPayload = (Object.keys(extras) as ExtraKey[])
      .filter((k) => (extras[k] || 0) > 0)
      .map((k) => ({
        id: k,
        name: `Extra ${k.charAt(0).toUpperCase() + k.slice(1)}`,
        quantity: extras[k],
        unitPrice: EXTRA_PROTEIN_PESEWAS[k],
      }));

    const cartItem: CartItem = {
      id: cartItemId,
      cartItemId,
      mealId: dbMealId || rawMealId,
      name: mealName,
      mealName,
      basePrice: basePricePesewas,
      basePricePesewas,
      quantity: 1,
      size: selectedSize,
      sizeLabel: MEAL_SIZES[selectedSize].label,
      includedProteinPackageName: selectedProtein,
      extras: { ...extras },
      configuration: {
        size: {
          name: MEAL_SIZES[selectedSize].label,
          priceModifier: basePricePesewas,
        },
        protein: {
          id: selectedProtein.toLowerCase().replace(/[^a-z0-9]/g, "-"),
          name: selectedProtein,
          priceModifier: 0,
        },
        extras: extrasPayload,
      },
      itemTotal: totalPesewas,
      itemSubtotalPesewas: totalPesewas,
    };

    addToCart(cartItem);
    router.push("/cart");
  };

  const media = getMealMedia(mealName || rawMealId);
  const displayImage = media.isolatedImage || media.image;

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col">
      {/* 1. HERO SECTION (THE 3D POP) */}
      <section className="relative w-full bg-brand-red text-white overflow-hidden pb-24 sm:pb-32 pt-10 sm:pt-14 shadow-lg">
        {/* Parallax Background Pedestal Block */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#871410] to-[#9E1B15] pointer-events-none transition-transform ease-out"
          style={{
            transform: `translateY(${Math.min(scrollY * 0.2, 50)}px)`,
          }}
        >
          {/* Subtle geometric lighting accents */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        </div>

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 z-10">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/80 hover:text-white transition-colors py-1 px-3 rounded-full bg-white/10 backdrop-blur-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Back to Menu</span>
            </Link>

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-yellow bg-black/20 px-3 py-1 rounded-full">
              Fresh Daily
            </span>
          </div>

          {/* Meal Title & Factual Description */}
          <div className="text-center space-y-2">
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
              {mealName}
            </h1>
            {mealDescription && (
              <p className="text-xs sm:text-sm text-white/80 max-w-md mx-auto font-normal leading-relaxed">
                {mealDescription}
              </p>
            )}
          </div>

          {/* 3D Pedestal & Isolated Food Image (Breaks container bounds) */}
          <div className="relative mt-8 sm:mt-12 flex justify-center items-center">
            {/* Sculpted Pedestal Base */}
            <div
              className="w-64 sm:w-80 h-28 sm:h-36 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 shadow-2xl absolute -bottom-8 pointer-events-none"
              style={{
                transform: `scale(1, 0.35) translateY(${Math.min(scrollY * 0.1, 20)}px)`,
              }}
            />

            {/* Isolated Food Image Breaking Out of Container Bounds */}
            <div
              className="relative w-64 h-64 sm:w-80 sm:h-80 -mb-28 sm:-mb-36 z-20 transition-transform ease-out will-change-transform"
              style={{
                transform: `translateY(${Math.min(scrollY * -0.08, 0)}px)`,
              }}
            >
              <Image
                src={displayImage}
                alt={mealName}
                fill
                priority
                sizes="(max-width: 640px) 256px, 320px"
                className="object-contain drop-shadow-[0_25px_30px_rgba(0,0,0,0.40)] select-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. CONFIGURATION FORM (SINGLE-COLUMN MOBILE-FIRST STACK) */}
      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 pt-24 sm:pt-32 pb-40 space-y-8">
        {/* Step 1: Size Selection (Tactile Cards) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
              1. Choose Size
            </span>
            <span className="text-xs text-brand-muted font-medium">Includes protein</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
            {(Object.keys(MEAL_SIZES) as SizeKey[]).map((sizeKey) => {
              const sizeData = MEAL_SIZES[sizeKey];
              const isSelected = selectedSize === sizeKey;
              const hasSelection = selectedSize !== null;

              return (
                <button
                  key={sizeKey}
                  type="button"
                  onClick={() => handleSizeSelect(sizeKey)}
                  className={`relative px-2.5 py-2 sm:px-4 sm:py-3 text-[11px] sm:text-xs md:text-sm rounded-2xl text-left border transition-all duration-200 cursor-pointer min-h-[44px] ${
                    isSelected
                      ? "bg-brand-yellow text-brand-dark border-brand-yellow-dark shadow-md scale-105 z-10 ring-2 ring-brand-yellow/50"
                      : hasSelection
                        ? "bg-transparent border-black/15 text-brand-dark opacity-60 hover:opacity-100 hover:border-black/30"
                        : "bg-transparent border-black/15 text-brand-dark hover:border-black/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="flex items-center gap-1.5 sm:gap-2 font-black font-display text-[11px] sm:text-xs md:text-sm uppercase tracking-tight">
                      {sizeData.label}
                      {isSelected && (
                        <CheckCircle size={16} className="text-brand-dark flex-shrink-0" />
                      )}
                    </span>
                  </div>
                  <div className="font-bold text-[11px] sm:text-xs md:text-sm text-brand-dark">
                    {formatGHS(sizeData.basePesewas)}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Included Protein Packages (Horizontal Scroll) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
              2. Included Protein
            </span>
            <span className="text-xs text-brand-muted font-medium">
              {selectedSize ? `Options for ${MEAL_SIZES[selectedSize].label}` : "Select a size first"}
            </span>
          </div>

          {selectedSize ? (
            <div className="grid grid-cols-2 gap-3 w-full">
              {INCLUDED_PROTEIN_OPTIONS[selectedSize].map((proteinName) => {
                const isSelected = selectedProtein === proteinName;

                return (
                  <button
                    key={proteinName}
                    type="button"
                    onClick={() => setSelectedProtein(proteinName)}
                    className={`relative rounded-2xl p-4 sm:p-5 flex flex-col justify-between text-left cursor-pointer transition-all duration-200 min-h-[110px] sm:min-h-[120px] ${
                      isSelected
                        ? "bg-white border-2 border-brand-red text-brand-dark shadow-sm ring-2 ring-brand-red/20"
                        : "bg-white border border-black/10 text-brand-dark hover:border-black/25 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="font-display font-black text-xs sm:text-sm text-brand-dark leading-snug uppercase break-words">
                        {proteinName}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-brand-red text-white flex items-center justify-center shadow-xs flex-shrink-0">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <div className="text-[11px] font-bold text-brand-muted">
                      Included · +GH₵ 0.00
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/60 border border-black/10 rounded-2xl p-6 text-center text-xs text-brand-muted">
              Please choose a portion size above to view included protein options.
            </div>
          )}
        </section>

        {/* Step 3: Extras & Sides (Inline Steppers) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
              3. Extra Protein &amp; Sides
            </span>
            <span className="text-xs text-brand-muted font-medium">Optional additions</span>
          </div>

          <div className="bg-white rounded-2xl border border-brand-cream-dark shadow-sm divide-y divide-brand-cream-dark overflow-hidden">
            {(Object.keys(EXTRA_PROTEIN_PESEWAS) as ExtraKey[]).map((extraKey) => {
              const qty = extras[extraKey] || 0;
              const unitPrice = EXTRA_PROTEIN_PESEWAS[extraKey];
              const title = `Extra ${extraKey.charAt(0).toUpperCase() + extraKey.slice(1)}`;

              return (
                <div
                  key={extraKey}
                  className="p-4 sm:p-4.5 flex items-center justify-between gap-4 transition-colors hover:bg-brand-cream/30"
                >
                  <div>
                    <h4 className="font-bold text-sm text-brand-dark">{title}</h4>
                    <span className="text-xs font-semibold text-brand-muted">
                      +{formatGHS(unitPrice)}
                    </span>
                  </div>

                  {/* Morphing Button: Pill "+ Add" morphs into Inline Stepper [- | qty | +] */}
                  <div>
                    {qty === 0 ? (
                      <button
                        type="button"
                        onClick={() => handleExtraIncrement(extraKey)}
                        className="px-4 py-1.5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-all duration-150 shadow-xs flex items-center gap-1 active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>Add</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-brand-cream border border-brand-cream-dark rounded-full p-1 shadow-xs">
                        <button
                          type="button"
                          onClick={() => handleExtraDecrement(extraKey)}
                          className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-black/5 active:scale-90 transition-transform"
                          aria-label={`Decrease ${title}`}
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>

                        <span className="w-6 text-center text-xs font-black text-brand-dark">
                          {qty}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleExtraIncrement(extraKey)}
                          className="w-7 h-7 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark hover:bg-brand-yellow-dark active:scale-90 transition-transform"
                          aria-label={`Increase ${title}`}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 3. STICKY FOOTER & PROGRESS CTA */}
      <footer className="fixed bottom-0 left-0 w-full z-50 bg-[#FAF5EE]/95 backdrop-blur-md border-t border-brand-cream-dark shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-4">
          {/* Live Price Animation */}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-muted">
              Running Total
            </span>
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.span
                  key={totalPesewas}
                  initial={{ y: 8, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="font-display font-black text-2xl sm:text-3xl text-brand-dark tracking-tight inline-block"
                >
                  {formatGHS(totalPesewas)}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          {/* Dynamic Call-to-Action (Progress Indicator) */}
          <div className="flex-1 max-w-xs">
            <button
              type="button"
              disabled={!isReadyToAddToCart || loading}
              onClick={handleAddToCart}
              className={`w-full py-4 px-6 rounded-full font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                isReadyToAddToCart && !loading
                  ? "bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark shadow-button-yellow transform hover:-translate-y-0.5 cursor-pointer"
                  : "bg-black/10 text-brand-muted cursor-not-allowed"
              }`}
            >
              <span>{isReadyToAddToCart ? "Add to Cart" : "Select a Size/Protein"}</span>
              {isReadyToAddToCart && <ArrowRight className="w-4 h-4 stroke-[3]" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
