import React from "react";
import { CreditCard, Bike, ShieldCheck } from "lucide-react";

export interface SplitPaymentCardProps {
  payNowAmount: string; // e.g. "GH₵70.00"
  payRiderAmount: string; // e.g. "GH₵20.00" or "Calculated at checkout"
  isRiderAmountPending?: boolean;
  className?: string;
}

export function SplitPaymentCard({
  payNowAmount,
  payRiderAmount,
  isRiderAmountPending = false,
  className = "",
}: SplitPaymentCardProps) {
  return (
    <div
      className={`bg-surface2/90 border border-brand-gold/40 rounded-2xl p-4 sm:p-5 mt-3 shadow-lg space-y-3.5 ${className}`.trim()}
    >
      <div className="flex items-center gap-2 pb-2.5 border-b border-line/60 text-xs font-bold uppercase tracking-wider text-brand-gold">
        <ShieldCheck className="w-4 h-4 text-brand-gold" />
        <span>Two-Part Payment Breakdown</span>
      </div>

      <div className="flex justify-between items-center py-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-gold/20 flex items-center justify-center text-brand-gold">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs sm:text-sm text-ink">
              Pay Now (Food Subtotal)
            </div>
            <div className="text-[11px] text-ink-dim">
              Prepaid securely via Paystack
            </div>
          </div>
        </div>
        <span className="font-serif font-black text-base sm:text-lg text-brand-gold">
          {payNowAmount}
        </span>
      </div>

      <div className="flex justify-between items-center py-1 pt-2.5 border-t border-line/60">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-yellow/20 flex items-center justify-center text-brand-yellow">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-xs sm:text-sm text-ink">
              Pay Rider on Delivery
            </div>
            <div className="text-[11px] text-ink-dim">
              Directly to courier (Cash / MoMo)
            </div>
          </div>
        </div>
        <span
          className={`font-serif font-black text-base sm:text-lg ${
            isRiderAmountPending
              ? "text-ink-dim text-xs font-sans font-medium"
              : "text-brand-yellow"
          }`}
        >
          {payRiderAmount}
        </span>
      </div>

      <p className="text-[11px] text-ink-dim/90 leading-relaxed pt-1 border-t border-line/40">
        Notice: Food preparation begins upon online confirmation. Delivery fee is strictly handled with your courier upon delivery arrival.
      </p>
    </div>
  );
}
