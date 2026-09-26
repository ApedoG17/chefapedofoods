"use client";

import React from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { SplitPaymentCard } from "@/components/ui/SplitPaymentCard";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { formatGHS } from "@/lib/pricing";
import { ShoppingBag, ArrowRight, Trash2, Sparkles, Plus } from "lucide-react";

export default function CartPage() {
  const { items, subtotalPesewas, removeItem, isLoaded } = useCart();

  if (!isLoaded) {
    return (
      <main className="py-20 text-center text-ink-dim text-sm">
        Loading your cart…
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="space-y-6 pt-8 pb-16 text-center max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-full bg-surface2 border border-line flex items-center justify-center mx-auto text-brand-gold shadow-lg">
          <ShoppingBag className="w-8 h-8" />
        </div>

        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink mb-2">
            Your Cart is Empty
          </h1>
          <p className="text-xs sm:text-sm text-ink-dim max-w-sm mx-auto leading-relaxed">
            You haven&apos;t added any meals to your lunch order yet.
          </p>
        </div>

        <div className="pt-2">
          <Link href="/menu">
            <Button variant="primary" className="shadow-gold-glow px-8 py-3.5">
              Browse Today&apos;s Menu
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1 of 4</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight">
          Review Your Order
        </h1>
        <p className="text-xs sm:text-sm text-ink-dim">
          Review your items before proceeding to delivery details.
        </p>
      </div>

      {/* Cart Items List */}
      <div className="space-y-4">
        {items.map((item) => {
          // Format active extra proteins
          const extrasList = Object.entries(item.extras || {})
            .filter(([, qty]) => typeof qty === "number" && qty > 0)
            .map(([name, qty]) => `${qty}x Extra ${name.charAt(0).toUpperCase() + name.slice(1)}`);

          const detailsNote = [
            item.sizeLabel,
            item.includedProteinPackageName,
            ...extrasList,
            `Qty ${item.quantity}`,
          ].join(" · ");

          return (
            <div
              key={item.id}
              className="bg-surface2/80 border border-line rounded-3xl p-5 shadow-md flex flex-col justify-between gap-4"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink">
                    {item.mealName}
                  </h3>
                  <p className="text-xs text-brand-gold-soft mt-1 leading-relaxed">
                    {detailsNote}
                  </p>
                </div>
                <div className="font-serif font-black text-lg text-brand-gold flex-none">
                  {formatGHS(item.itemSubtotalPesewas)}
                </div>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-line/60">
                <Link
                  href="/menu"
                  className="text-xs text-ink-dim hover:text-brand-gold transition-colors inline-flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add another meal</span>
                </Link>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-xs font-semibold text-warn hover:text-warn/80 transition-colors inline-flex items-center gap-1.5 p-1 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pricing Summary & Split Payment Card */}
      <div className="bg-surface2/80 border border-line rounded-3xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="text-xs font-bold uppercase tracking-wider text-brand-gold">
          Order Summary
        </div>

        <div className="flex justify-between items-center py-2 text-sm border-b border-line/60">
          <span className="text-ink">Food subtotal</span>
          <span className="font-serif font-bold text-base text-ink">
            {formatGHS(subtotalPesewas)}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 text-xs text-ink-dim">
          <span>Delivery fee</span>
          <span>Calculated at checkout (Starts from GH₵10)</span>
        </div>

        {/* Split Payment Card — strictly separate UI */}
        <SplitPaymentCard
          payNowAmount={formatGHS(subtotalPesewas)}
          payRiderAmount="Calculated at checkout"
          isRiderAmountPending={true}
        />
      </div>

      {/* Sticky CTA */}
      <StickyCTA>
        <div className="max-w-2xl mx-auto w-full">
          <Link href="/checkout" className="block w-full">
            <Button
              variant="primary"
              className="w-full shadow-gold-glow py-4 text-base font-bold flex items-center justify-center gap-2"
            >
              <span>Continue to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </StickyCTA>
    </main>
  );
}
