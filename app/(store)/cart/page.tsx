"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/lib/cart/store";
import { formatGHS } from "@/lib/pricing";
import { getMealMedia } from "@/lib/media/meals";
import { ShoppingBag, ArrowRight, Plus, Minus, ShieldCheck, Bike, ArrowLeft } from "lucide-react";

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

        <Link
          href="/menu"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-button-yellow"
        >
          <span>Browse Today&apos;s Menu</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </Link>
      </main>
    );
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

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-brand-cream-dark shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-start gap-4">
                <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-brand-cream-dark flex-none border border-black/5">
                  <Image
                    src={media.image}
                    alt={item.mealName}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-base sm:text-lg text-brand-dark uppercase">
                    {item.mealName}
                  </h3>

                  {/* Bulleted Customization List */}
                  <ul className="text-xs text-brand-muted space-y-0.5 font-medium">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                      <span>Portion: <strong className="text-brand-dark font-semibold">{item.sizeLabel}</strong></span>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow-dark" />
                      <span>Protein: <strong className="text-brand-dark font-semibold">{item.includedProteinPackageName}</strong></span>
                    </li>
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

                {/* Inline Quantity Stepper */}
                <div className="flex items-center border border-brand-cream-dark rounded-full bg-brand-cream p-0.5">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-black/5 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-8 text-center text-xs font-black text-brand-dark">
                    {item.quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-brand-dark hover:bg-black/5 transition-colors"
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
            <span className="font-semibold text-brand-dark">From GH₵10.00</span>
          </div>
        </div>

        <div className="p-3 bg-brand-cream rounded-xl text-xs text-brand-muted space-y-1">
          <div className="font-bold text-brand-dark">Payment Clarity:</div>
          <div>
            1. You pay <strong>{formatGHS(subtotalPesewas)}</strong> now via Paystack to secure kitchen preparation.
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
