"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Flame,
  Plus,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { ORDERING_HOURS, MEAL_SIZES } from "@/config/business";
import { formatGHS } from "@/lib/pricing";
import { addToCart, type CartItem } from "@/lib/cart/store";

interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

interface MenuItemData {
  id: string;
  name: string;
  description: string;
  pricePesewas: number;
  image: string;
  category: "rice-dishes" | "sides" | "drinks";
  isFeatured?: boolean;
  badge?: string;
  isCustomizable?: boolean;
}

const MENU_CATEGORIES = [
  { id: "rice-dishes", label: "Signature Rice Dishes" },
  { id: "sides", label: "Extras & Proteins" },
  { id: "drinks", label: "Drinks & Refreshments" },
] as const;

const STATIC_MENU_ITEMS: MenuItemData[] = [
  // 1. Signature Rice Dishes
  {
    id: "jollof-rice",
    name: "Jollof Rice",
    description: "Ghanaian-style smoky jollof rice prepared fresh each morning in small batches with real local aromatics.",
    pricePesewas: MEAL_SIZES.small.basePesewas,
    image: "/images/meals/jollof-isolated.png",
    category: "rice-dishes",
    isFeatured: true,
    isCustomizable: true,
  },
  {
    id: "fried-rice",
    name: "Fried Rice",
    description: "Ghanaian-style seasoned wok fried rice with crisp garden vegetables and tender seasonings.",
    pricePesewas: MEAL_SIZES.small.basePesewas,
    image: "/images/meals/fried-rice-isolated.png",
    category: "rice-dishes",
    isCustomizable: true,
  },
  {
    id: "plain-rice-and-stew",
    name: "Plain Rice & Stew",
    description: "Fluffy steamed white jasmine rice served with Chef Apedo's authentic rich tomato and meat stew.",
    pricePesewas: MEAL_SIZES.small.basePesewas,
    image: "/images/meals/plain-rice-isolated.png",
    category: "rice-dishes",
    isCustomizable: true,
  },

  // 2. Extras & Sides (Deep Burgundy Category)
  {
    id: "chicken",
    name: "Chicken Portion",
    description: "Golden seasoned fried chicken quarter leg with crispy skin and deeply infused local spices.",
    pricePesewas: 1500,
    image: "/images/meals/chicken-isolated.png",
    category: "sides",
  },
  {
    id: "fish",
    name: "Fried Fish",
    description: "Seasoned crispy fried fish steak portion with golden peppery crust.",
    pricePesewas: 400,
    image: "/images/meals/fish-isolated.png",
    category: "sides",
  },
  {
    id: "sausage",
    name: "Extra Sausage",
    description: "Tender seasoned frankfurter portion lightly charred for savory depth.",
    pricePesewas: 400,
    image: "/images/meals/sausages-isolated.png",
    category: "sides",
  },
  {
    id: "egg",
    name: "Boiled or Fried Egg",
    description: "Freshly prepared farm egg cooked to order to top your plate.",
    pricePesewas: 400,
    image: "/images/meals/egg-isolated.png",
    category: "sides",
  },

  // 3. Drinks & Refreshments (Dark Roast Category)
  {
    id: "sobolo",
    name: "Fresh Hibiscus Sobolo",
    description: "Chilled dark ruby red hibiscus sobolo infused with ginger, cloves, and fresh crushed mint leaves.",
    pricePesewas: 1000,
    image: "/images/meals/sobolo-isolated.png",
    category: "drinks",
  },
  {
    id: "water",
    name: "Bottled Mineral Water",
    description: "Chilled purified still mineral water (750ml).",
    pricePesewas: 500,
    image: "/images/meals/water-isolated.png",
    category: "drinks",
  },
  {
    id: "soft-drink",
    name: "Chilled Soft Drink",
    description: "Assorted cold carbonated soft drinks in classic glass bottle.",
    pricePesewas: 800,
    image: "/images/meals/sobolo-isolated.png",
    category: "drinks",
  },
];

export default function MenuStorefrontPage() {
  const [activeCategory, setActiveCategory] = useState<string>("rice-dishes");
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  // Intersection Observer for sticky category navigation
  useEffect(() => {
    const handleScroll = () => {
      const categoryIds = MENU_CATEGORIES.map((c) => c.id);
      for (const id of categoryIds) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Active when section top is near the sticky header (approx 200px from viewport top)
          if (rect.top <= 250 && rect.bottom >= 200) {
            setActiveCategory(id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Smooth scroll to category anchor with generous clearance
  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const target = document.getElementById(categoryId);
    if (target) {
      const topOffset = 150; // accounts for floating navbar + sticky pill
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - topOffset,
        behavior: "smooth",
      });
    }
  };

  // Phase 4: Cart Fly-In Animation Trigger
  const triggerCartFlyIn = (item: MenuItemData, sourceImgEl: HTMLElement | null) => {
    const cartTarget = document.getElementById("global-cart-target");
    if (!cartTarget) {
      handleDirectAddToCart(item);
      return;
    }

    const startRect = sourceImgEl
      ? sourceImgEl.getBoundingClientRect()
      : { left: window.innerWidth / 2 - 40, top: window.innerHeight / 2, width: 80, height: 80 };
    const targetRect = cartTarget.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2 - 32;
    const startY = startRect.top + startRect.height / 2 - 32;
    const endX = targetRect.left + targetRect.width / 2 - 16;
    const endY = targetRect.top + targetRect.height / 2 - 16;

    const flyId = `${item.id}-${Date.now()}`;
    const newFlyer: FlyingItem = {
      id: flyId,
      image: item.image,
      startX,
      startY,
      endX,
      endY,
    };

    setFlyingItems((prev) => [...prev, newFlyer]);

    // Dispatch to store once flight arrives at navbar target (~550ms)
    setTimeout(() => {
      handleDirectAddToCart(item);
      setFlyingItems((prev) => prev.filter((f) => f.id !== flyId));
    }, 550);
  };

  // Helper to add directly to cart
  const handleDirectAddToCart = (item: MenuItemData) => {
    const isRice = item.category === "rice-dishes";
    const cartItem: CartItem = {
      id: `${item.id}-${Date.now()}`,
      cartItemId: `${item.id}-${Date.now()}`,
      mealId: item.id,
      name: item.name,
      mealName: item.name,
      basePrice: item.pricePesewas,
      basePricePesewas: item.pricePesewas,
      quantity: 1,
      size: "small",
      sizeLabel: isRice ? "Small" : "Standard",
      includedProteinPackageName: isRice ? "2 Sausages" : "Standard",
      category: item.category,
      extras: item.category === "sides" ? { [item.id]: 1 } : {},
      configuration: {
        size: {
          name: isRice ? "Small" : "Standard",
          priceModifier: item.pricePesewas,
        },
        protein: {
          id: isRice ? "2-sausages" : "none",
          name: isRice ? "2 Sausages" : "None",
          priceModifier: 0,
        },
        extras:
          item.category === "sides"
            ? [{ id: item.id, name: item.name, quantity: 1, unitPrice: item.pricePesewas }]
            : [],
      },
      itemTotal: item.pricePesewas,
      itemSubtotalPesewas: item.pricePesewas,
    };

    addToCart(cartItem);
  };

  const riceItems = STATIC_MENU_ITEMS.filter((m) => m.category === "rice-dishes");
  const sideItems = STATIC_MENU_ITEMS.filter((m) => m.category === "sides");
  const drinkItems = STATIC_MENU_ITEMS.filter((m) => m.category === "drinks");

  const defaultTheme = {
    bar: "bg-[#FAF5EE]/95 border-brand-cream-dark text-brand-dark shadow-xs",
    activePill: "bg-brand-red text-white shadow-button-red",
    inactivePill: "text-brand-dark/70 hover:text-brand-dark hover:bg-black/5",
  };

  const categoryThemeStyles: Record<string, { bar: string; activePill: string; inactivePill: string }> = {
    "rice-dishes": defaultTheme,
    sides: {
      bar: "bg-[#661014]/95 border-white/10 text-white shadow-md",
      activePill: "bg-brand-yellow text-brand-dark shadow-button-yellow",
      inactivePill: "text-white/70 hover:text-white hover:bg-white/10",
    },
    drinks: {
      bar: "bg-[#18110E]/95 border-white/10 text-white shadow-md",
      activePill: "bg-brand-yellow text-brand-dark shadow-button-yellow",
      inactivePill: "text-white/70 hover:text-white hover:bg-white/10",
    },
  };

  const currentTheme = categoryThemeStyles[activeCategory] ?? defaultTheme;

  const jollofItem = riceItems[0]!;
  const friedRiceItem = riceItems[1]!;
  const plainRiceItem = riceItems[2]!;

  return (
    <div className="w-full min-h-screen bg-brand-cream text-brand-dark flex flex-col relative selection:bg-brand-yellow selection:text-brand-dark overflow-x-clip">
      {/* ========================================================================= */}
      {/* 1. STOREFRONT HERO EDITORIAL HEADER                                        */}
      {/* ========================================================================= */}
      <section className="w-full bg-brand-red text-white pt-10 sm:pt-14 pb-14 sm:pb-20 px-4 sm:px-6 md:px-12 lg:px-24 border-b border-black/10 relative overflow-hidden">
        {/* Subtle geometric lighting */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-brand-yellow/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
            {/* Left Column: Text */}
            <div className="space-y-4 text-left">
              {/* Cutoff pill badge */}
              <div className="inline-flex items-center gap-2 bg-black/25 text-brand-yellow px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-white/10">
                <Clock className="w-3.5 h-3.5" />
                <span>Same-Day Cutoff: {ORDERING_HOURS.sameDayCutoff}</span>
              </div>

              <h1 className="font-display font-black text-[2.5rem] sm:text-5xl md:text-[5rem] leading-[0.9] uppercase mb-6 tracking-tight text-white">
                THE DAILY<br/>MENU.
              </h1>

              <p className="text-sm sm:text-base text-white/90 max-w-md leading-relaxed font-sans font-normal">
                Authentic Ghanaian staples simmered fresh each morning in small batches. Choose your base size, customize included proteins, and have it delivered piping hot across Accra.
              </p>

              {/* Quick Factual Operational Strip */}
              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-white/80 font-medium">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>Morning Batch Cooking</span>
                </span>
                <span>·</span>
                <span>First Delivery Slot: {ORDERING_HOURS.firstDeliverySlot}</span>
                <span>·</span>
                <span>Rider fee from GH₵10 on delivery</span>
              </div>
            </div>

            {/* Right Column: Floating Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="flex justify-center md:justify-end relative w-full h-[280px] sm:h-[350px] md:h-[380px] lg:h-[420px] mt-4 md:mt-0 overflow-hidden"
            >
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full max-w-[300px] sm:max-w-[420px] md:max-w-none h-full"
              >
                <Image
                  src="/images/meals/jollof-isolated.png"
                  alt="Signature Jollof"
                  fill
                  priority
                  sizes="(max-width: 768px) 300px, (max-width: 1024px) 450px, 550px"
                  className="object-contain drop-shadow-2xl origin-center"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHASE 1: THE ADAPTIVE STICKY CATEGORY DOCK                                */}
      {/* ========================================================================= */}
      <div
        className={`sticky top-16 sm:top-20 z-30 w-full backdrop-blur-xl border-b py-2 px-4 transition-colors duration-300 ${
          currentTheme.bar
        }`}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-start sm:justify-center overflow-x-auto no-scrollbar gap-2">
          {MENU_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToCategory(cat.id)}
                className={`whitespace-nowrap px-4 sm:px-5 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  isActive ? currentTheme.activePill : currentTheme.inactivePill
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PHASE 2 & 3: EDITORIAL MENU SECTIONS WITH ASYMMETRICAL 3D CARDS           */}
      {/* ========================================================================= */}

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 1: SIGNATURE RICE DISHES (WARM CREAM BACKGROUND)                 */}
      {/* ------------------------------------------------------------------------- */}
      <section
        id="rice-dishes"
        className="w-full bg-[#FAF5EE] text-brand-dark py-14 sm:py-20 border-b border-brand-cream-dark scroll-mt-36"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-brand-cream-dark pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
                Section 01 · Handcrafted Staples
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-brand-dark mt-1">
                Signature Rice Dishes
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-brand-muted max-w-sm">
              All rice plates include protein package (Chicken, Sausage, or Eggs) with base price.
            </p>
          </div>

          {/* Asymmetrical Grid for 3 Rice Dishes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pt-8">
            {/* 1. Featured Jollof Rice (Spans 2 columns on desktop) */}
            <div className="md:col-span-2">
              <MealCard3D
                item={jollofItem}
                isFeatured={true}
                theme="light"
                onQuickAdd={(imgEl) => triggerCartFlyIn(jollofItem, imgEl)}
              />
            </div>

            {/* 2. Fried Rice */}
            <div className="col-span-1">
              <MealCard3D
                item={friedRiceItem}
                isFeatured={false}
                theme="light"
                onQuickAdd={(imgEl) => triggerCartFlyIn(friedRiceItem, imgEl)}
              />
            </div>

            {/* 3. Plain Rice & Stew */}
            <div className="col-span-1">
              <MealCard3D
                item={plainRiceItem}
                isFeatured={false}
                theme="light"
                onQuickAdd={(imgEl) => triggerCartFlyIn(plainRiceItem, imgEl)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 2: EXTRAS & SIDES (DEEP BURGUNDY RED BACKGROUND)                  */}
      {/* ------------------------------------------------------------------------- */}
      <section
        id="sides"
        className="w-full bg-brand-red text-white py-16 sm:py-24 border-b border-black/10 scroll-mt-36 relative overflow-hidden"
      >
        {/* Ambient atmospheric backdrop */}
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-black/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/15 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-yellow">
                Section 02 · Extra Portions
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white mt-1">
                Extras &amp; Proteins
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/80 max-w-sm">
              Add individual portions to accompany your rice or build a high-protein feast.
            </p>
          </div>

          {/* Balanced 4-Column Grid for Sides */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 pt-8">
            {sideItems.map((item) => (
              <MealCard3D
                key={item.id}
                item={item}
                isFeatured={false}
                theme="dark"
                onQuickAdd={(imgEl) => triggerCartFlyIn(item, imgEl)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------------- */}
      {/* SECTION 3: DRINKS & REFRESHMENTS (WARM DARK ROAST BACKGROUND)             */}
      {/* ------------------------------------------------------------------------- */}
      <section
        id="drinks"
        className="w-full bg-[#18110E] text-white py-16 sm:py-24 border-b border-white/10 scroll-mt-36"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-yellow">
                Section 03 · Cold Brewed &amp; Chilled
              </span>
              <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white mt-1">
                Drinks &amp; Refreshments
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/70 max-w-sm">
              Authentic artisanal hibiscus sobolo and cold bottled refreshments.
            </p>
          </div>

          {/* Balanced 3-Column Grid for Drinks */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 pt-8 max-w-4xl mx-auto">
            {drinkItems.map((item) => (
              <MealCard3D
                key={item.id}
                item={item}
                isFeatured={false}
                theme="dark"
                onQuickAdd={(imgEl) => triggerCartFlyIn(item, imgEl)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* PHASE 4: HIGH Z-INDEX PORTAL FOR CART FLY-IN ANIMATIONS                   */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {flyingItems.map((f) => (
          <motion.div
            key={f.id}
            initial={{
              x: f.startX,
              y: f.startY,
              scale: 1,
              opacity: 1,
              rotate: 0,
            }}
            animate={{
              x: [f.startX, (f.startX + f.endX) / 2, f.endX],
              y: [f.startY, f.startY - 130, f.endY],
              scale: [1, 0.7, 0.15],
              opacity: [1, 1, 0],
              rotate: [0, 15, 45],
            }}
            transition={{
              duration: 0.55,
              ease: "easeInOut",
            }}
            className="absolute w-20 h-20"
          >
            <Image
              src={f.image}
              alt="Flying Food"
              fill
              className="object-contain drop-shadow-[0_15px_20px_rgba(0,0,0,0.4)]"
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ===============================================================================
// PHASE 3: 3D MEAL CARD COMPONENT WITH OUT-OF-BOUNDS IMAGE & MICRO-INTERACTIONS
// ===============================================================================
interface MealCard3DProps {
  item: MenuItemData;
  isFeatured?: boolean;
  theme: "light" | "dark";
  onQuickAdd: (imgEl: HTMLElement | null) => void;
}

function MealCard3D({ item, isFeatured = false, theme, onQuickAdd }: MealCard3DProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const isLight = theme === "light";

  return (
    <motion.div
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-shadow duration-300 group ${
        isFeatured
          ? "pt-28 sm:pt-36 mt-16 sm:mt-24 shadow-xl"
          : "pt-24 sm:pt-28 mt-14 sm:mt-18 shadow-md hover:shadow-xl"
      } ${
        isLight
          ? "bg-white border border-brand-cream-dark text-brand-dark"
          : "bg-white/10 backdrop-blur-md border border-white/20 text-white"
      }`}
    >
      {/* 1. Out-of-Bounds Isolated Food PNG */}
      <div
        ref={imgRef}
        className={`absolute left-1/2 -translate-x-1/2 pointer-events-none transition-transform duration-300 ease-out group-hover:scale-105 ${
          isFeatured
            ? "-top-24 sm:-top-32 w-56 h-56 sm:w-72 sm:h-72"
            : "-top-16 sm:-top-20 w-36 h-36 sm:w-44 sm:h-44"
        }`}
      >
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes={isFeatured ? "(max-width: 768px) 250px, 320px" : "180px"}
          className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)] select-none"
        />
      </div>

      {/* 2. Top Header (Portion / Customizable Indicator) */}
      <div className="flex items-center justify-end mb-4">
        <span
          className={`text-[11px] font-bold ${
            isLight ? "text-brand-muted" : "text-white/60"
          }`}
        >
          {item.isCustomizable ? "Customizable" : "Portion"}
        </span>
      </div>

      {/* 3. Text Content */}
      <div className="space-y-2 mb-6">
        <h3
          className={`font-display font-black uppercase tracking-wide leading-tight ${
            isFeatured ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl"
          }`}
        >
          {item.name}
        </h3>

        <p
          className={`text-xs sm:text-sm line-clamp-2 leading-relaxed ${
            isLight ? "text-brand-muted" : "text-white/80"
          }`}
        >
          {item.description}
        </p>

        {/* Feature Highlights for Rice Dishes */}
        {isFeatured && item.category === "rice-dishes" && (
          <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-bold">
            <span
              className={`px-3 py-1 rounded-full ${
                isLight ? "bg-brand-cream border border-brand-cream-dark text-brand-dark" : "bg-white/10 text-white"
              }`}
            >
              Small: GH₵45
            </span>
            <span
              className={`px-3 py-1 rounded-full ${
                isLight ? "bg-brand-cream border border-brand-cream-dark text-brand-dark" : "bg-white/10 text-white"
              }`}
            >
              Medium: GH₵70
            </span>
            <span
              className={`px-3 py-1 rounded-full ${
                isLight ? "bg-brand-cream border border-brand-cream-dark text-brand-dark" : "bg-white/10 text-white"
              }`}
            >
              Large: GH₵90
            </span>
          </div>
        )}
      </div>

      {/* 4. Action Bar (2-Tier Layout: Never Overflows) */}
      <div
        className={`pt-4 border-t flex flex-col gap-3 ${
          isLight ? "border-brand-cream-dark" : "border-white/15"
        }`}
      >
        <div className="flex flex-col">
          <span
            className={`text-[10px] font-bold uppercase tracking-wider ${
              isLight ? "text-brand-muted" : "text-white/60"
            }`}
          >
            {item.isCustomizable ? "From" : "Price"}
          </span>
          <span
            className={`font-display font-black text-2xl tracking-wide mt-0.5 ${
              isLight ? "text-brand-dark" : "text-white"
            }`}
          >
            {formatGHS(item.pricePesewas)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Add with Cart Fly-In Animation */}
          <button
            type="button"
            onClick={() => onQuickAdd(imgRef.current)}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95 flex-none ${
              isLight
                ? "bg-black/5 hover:bg-brand-yellow text-brand-dark hover:shadow-button-yellow"
                : "bg-white/15 hover:bg-brand-yellow hover:text-brand-dark text-white"
            }`}
            title="Quick Add to Cart"
            aria-label={`Quick add ${item.name} to cart`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Primary Action Button */}
          {item.isCustomizable ? (
            <Link
              href={`/menu/${item.id}`}
              className="flex-1 py-3 px-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <span>Customize</span>
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.5]" />
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onQuickAdd(imgRef.current)}
              className="flex-1 py-3 px-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider shadow-button-yellow transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add to Bag</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
