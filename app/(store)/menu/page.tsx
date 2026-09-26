import React from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MealCard } from "@/components/menu/MealCard";
import { Banner } from "@/components/ui/Banner";
import { formatGHS } from "@/lib/pricing";
import { ORDERING_HOURS } from "@/config/business";
import { Clock, Sparkles, Bike } from "lucide-react";

export const revalidate = 0; // Fresh menu status on every request

interface FallbackMeal {
  id: string;
  name: string;
  description: string;
  available: boolean;
  minPricePesewas: number;
}

const DEFAULT_MEALS: FallbackMeal[] = [
  {
    id: "jollof-rice",
    name: "Jollof Rice",
    description: "Ghanaian-style fragrant jollof rice cooked in rich spiced tomato sauce with subtle smoky undertones.",
    available: true,
    minPricePesewas: 4500,
  },
  {
    id: "fried-rice",
    name: "Fried Rice",
    description: "Seasoned Ghanaian fried rice with diced sweet vegetables, aromatics, and rich house shito.",
    available: true,
    minPricePesewas: 4500,
  },
  {
    id: "plain-rice-and-stew",
    name: "Plain Rice & Stew",
    description: "Fluffy white jasmine rice served with rich, savory Ghanaian beef and chicken stew slow-braised to tenderness.",
    available: true,
    minPricePesewas: 4500,
  },
];

export default async function MenuPage() {
  let displayMeals: FallbackMeal[] = DEFAULT_MEALS;

  try {
    const supabase = await createServerSupabaseClient();
    const { data: meals, error } = await supabase
      .from("meals")
      .select(`
        id,
        name,
        description,
        available,
        meal_sizes (
          base_price_pesewas
        )
      `)
      .order("name");

    if (!error && meals && meals.length > 0) {
      displayMeals = meals.map((m) => {
        const prices = (m.meal_sizes as { base_price_pesewas: number }[])?.map(
          (s) => s.base_price_pesewas
        ) || [4500];
        const minPrice = Math.min(...prices);
        return {
          id: m.id,
          name: m.name,
          description: m.description || "",
          available: m.available,
          minPricePesewas: minPrice,
        };
      });
    }
  } catch (e) {
    console.warn("Could not query live meals, using default menu:", e);
  }

  return (
    <main className="space-y-8 pb-16">
      {/* Editorial Header */}
      <div className="space-y-3 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Accra Lunch Service</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl text-ink tracking-tight">
          Today&apos;s Menu
        </h1>
        <p className="text-sm sm:text-base text-ink-dim max-w-2xl leading-relaxed">
          Select a meal below to choose your size, select your included protein package, and add extra proteins.
        </p>
      </div>

      {/* Same Day Cutoff Alert Banner */}
      <div className="p-4 rounded-2xl bg-surface2/90 border border-brand-gold/30 flex items-center gap-3 text-xs sm:text-sm text-ink shadow-md">
        <Clock className="w-5 h-5 text-brand-gold flex-none" />
        <div>
          Orders open until <strong className="text-brand-gold">{ORDERING_HOURS.sameDayCutoff} GMT</strong> for same-day lunch delivery. Delivery starts from {ORDERING_HOURS.firstDeliverySlot} GMT.
        </div>
      </div>

      {/* Grid of Meal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {displayMeals.map((meal) => (
          <MealCard
            key={meal.id}
            id={meal.id}
            name={meal.name}
            description={meal.description}
            startingPrice={`From ${formatGHS(meal.minPricePesewas)}`}
            available={meal.available}
          />
        ))}
      </div>

      {/* Practical Ordering Info Footer */}
      <div className="p-6 rounded-3xl bg-surface2/60 border border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-ink-dim">
        <div className="flex items-center gap-2">
          <Bike className="w-4 h-4 text-brand-gold" />
          <span>Delivery fee from GH₵10 is paid directly to the rider upon arrival.</span>
        </div>
        <span className="text-brand-gold-soft font-medium">All meals include protein in base price</span>
      </div>
    </main>
  );
}
