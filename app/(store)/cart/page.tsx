"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/store";
import { formatGHS } from "@/lib/pricing";
import { getMealMedia } from "@/lib/media/meals";
import { ShoppingBag, ArrowRight, Plus, Minus, ShieldCheck, Bike, ArrowLeft, MapPin } from "lucide-react";

// ---------------------------------------------------------------------------
// Empty-cart state: shows "Track Recent Order" if localStorage has a last order
// ---------------------------------------------------------------------------
function EmptyCartState() {
  const router = useRouter();
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("last_active_order");
    if (stored) setLastOrderId(stored);
  }, []);

  return (
    <main className="py-16 sm:py-24 text-center max-w-md mx-auto px-4">
      <div className="w-16 h-16 rounded-full bg-brand-cream border border-brand-cream-dark flex items-center justify-center mx-auto text-brand-dark mb-6">
        <ShoppingBag className="w-7 h-7 stroke-[2]" />
      </div>

      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark uppercase tracking-tight mb-2">
        Your Cart is Empty
      </h1>
      <p className="text-xs sm:text-sm text-brand-muted max-w-sm mx-auto leading-relaxed mb-8">
        You haven&apos;t added any meals to your lunch order yet.
      </p>

      <div className="flex flex-col items-center gap-3">
        <Link
          href="/menu"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-button-yellow"
        >
          <span>Browse Today&apos;s Menu</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </Link>

        {/* Recovery CTA: only shown when a recent order is in localStorage */}
        {lastOrderId && (
          <button
            type="button"
            onClick={() => router.push(`/order/${lastOrderId}`)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-brand-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:bg-brand-dark hover:text-white transition-all"
          >
            <MapPin className="w-4 h-4 stroke-[2.5]" />
            <span>Track Recent Order</span>
          </button>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Main cart page
// ---------------------------------------------------------------------------
export default function CartPage() {
  const { items, subtotalPesewas, removeItem, updateQuantity, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <main className="py-24 text-center text-brand-muted text-sm font-medium">
        Loading your cart…
      </main>
    );
  }

  if (items.length === 0) {
    return <EmptyCartState />;
  }

  return (
    <main className="w-full max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-cream-dark pb-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
            Step 1 of 2 · Order Review
          </span>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark uppercase tracking-tight mt-0.5">
            Your Lunch Order
          </h1>
        </div>
        <Link
          href="/menu"
          className="text-xs font-bold text-brand-muted hover:text-brand-dark inline-flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Menu</span>
        </Link>
      </div>

      {/* Item Breakdown (Horizontal Layout with Thumbnails) */}
      <div className="space-y-4">
        {items.map((item) => {
          const media = getMealMedia(item.mealName || item.mealId);
          const extrasList = Object.entries(item.extras || {})
            .filter(([, qty]) => typeof qty === "number" && qty > 0)
            .map(([name, qty]) => `${qty}x Extra ${name.charAt(0).toUpperCase() + name.slice(1)}`);

          // Determine whether this item is a beverage / drink category
          const isBeverage =
            item.category === "drinks" || item.category === "beverage";

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-brand-cream-dark shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-start gap-4">
                {/* ── Sprint 1 §1: Meal thumbnail with graceful fallback ── */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-brand-cream-dark flex-none border border-black/5">
                  {media?.image ? (
                    <Image
                      src={media.image}
                      alt={item.mealName}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    /* Fallback: branded placeholder with meal initial */
                    <div className="w-full h-full flex items-center justify-center bg-brand-cream text-brand-dark font-display font-black text-2xl uppercase">
                      {item.mealName?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-brand-dark uppercase">
                    {item.mealName}
                  </h3>

                  {/* ── Sprint 1 §1: Conditionally show Portion & Protein ── */}
                  <ul className="text-xs text-brand-muted space-y-0.5 font-medium">
                    {/* Portion: hidden for beverages and when value is "Standard" or "None" */}
                    {!isBeverage &&
                      item.sizeLabel !== "Standard" &&
                      item.sizeLabel !== "None" && (
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                          <span>
                            Portion:{" "}
                            <strong className="text-brand-dark font-semibold">
                              {item.sizeLabel}
                            </strong>
                          </span>
                        </li>
                      )}
                    {/* Protein: hidden for beverages and when value is "Standard" or "None" */}
                    {!isBeverage &&
                      item.includedProteinPackageName !== "Standard" &&
                      item.includedProteinPackageName !== "None" && (
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow-dark" />
                          <span>
                            Protein:{" "}
                            <strong className="text-brand-dark font-semibold">
                              {item.includedProteinPackageName}
                            </strong>
                          </span>
                        </li>
                      )}
                    {extrasList.map((extra, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-muted" />
                        <span>{extra}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Text-based Remove Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] font-bold text-brand-red hover:underline transition-colors"
                    >
                      Remove item
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Quantity Toggles & Price */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-brand-cream-dark gap-3">
                <div className="font-display font-extrabold text-lg sm:text-xl text-brand-dark">
                  {formatGHS(item.itemSubtotalPesewas)}
                </div>

                {/* ── Sprint 1 §2: Inline Quantity Stepper with manual input ── */}
                <div className="flex items-center border border-brand-cream-dark rounded-full bg-brand-cream p-1">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-8 h-8 sm:w-7 sm:h-7 min-w-[32px] min-h-[32px] rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-black/5 active:scale-95 transition-all shadow-2xs"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  {/* Manual numeric input; browser spin buttons are hidden via Tailwind */}
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => {
                      const parsed = parseInt(e.target.value, 10);
                      if (!isNaN(parsed) && parsed >= 1) {
                        updateQuantity(item.id, parsed);
                      }
                    }}
                    className="w-10 text-center text-xs font-black text-brand-dark bg-transparent outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                    aria-label="Item quantity"
                  />

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-8 h-8 sm:w-7 sm:h-7 min-w-[32px] min-h-[32px] rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-black/5 active:scale-95 transition-all shadow-2xs"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Another Meal Link */}
      <div className="text-center pt-1">
        <Link
          href="/menu"
          className="text-xs font-bold text-brand-red hover:text-brand-red-dark inline-flex items-center gap-1.5 uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add another meal to order</span>
        </Link>
      </div>

      {/* Pre-Checkout Summary Card */}
      <div className="bg-white rounded-2xl p-6 border border-brand-cream-dark shadow-sm space-y-4">
        <div className="text-xs font-black uppercase tracking-wider text-brand-dark border-b border-brand-cream-dark pb-2 flex justify-between items-center">
          <span>Order Summary</span>
          <span className="text-[11px] text-brand-muted font-medium">Guest Checkout</span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-brand-dark font-medium">Food Subtotal (Pay Online Now)</span>
            <span className="font-display font-extrabold text-xl text-brand-dark">
              {formatGHS(subtotalPesewas)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-brand-cream-dark text-xs text-brand-muted">
            <div className="flex items-center gap-1.5">
              <Bike className="w-4 h-4 text-brand-yellow-dark" />
              <span>Delivery Fee (Pay Rider on Arrival)</span>
            </div>
            <span className="text-xs sm:text-sm text-brand-dark/60 font-medium italic">
              Calculated at checkout based on location
            </span>
          </div>
        </div>

        <div className="p-3 bg-brand-cream rounded-xl text-xs text-brand-muted space-y-1">
          <div className="font-bold text-brand-dark">Payment Clarity:</div>
          <div>
            1. You pay <strong>{formatGHS(subtotalPesewas)}</strong> online via Hubtel (MoMo or Card) to secure kitchen preparation.
          </div>
          <div>
            2. You pay the delivery fee directly to the courier when your food arrives.
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Link
            href="/checkout"
            className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow"
          >
            <span>Proceed to Delivery Details</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>
      </div>
    </main>
  );
}
