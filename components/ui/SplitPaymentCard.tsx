import React from "react";
import { CreditCard, Bike } from "lucide-react";

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
      className={`bg-brand-espresso-surface border border-brand-gold/30 rounded-2xl p-4 sm:p-5 mt-3 shadow-warm-sm space-y-3.5 ${className}`.trim()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-line/50 text-[11px] font-medium uppercase tracking-wider text-brand-gold">
        <span>Payment Separation</span>
        <span className="text-[10px] text-ink-dim normal-case font-light">
          Required for fresh morning cooking
        </span>
      </div>

      <div className="flex justify-between items-center py-1">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-surface2 border border-line flex items-center justify-center text-brand-gold flex-none">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-medium text-xs sm:text-sm text-ink-dark">
              Pay Now (Food Subtotal)
            </div>
            <div className="text-[11px] text-ink-dim font-light">
              Prepaid securely online (Hubtel / MoMo)
            </div>
          </div>
        </div>
        <span className="font-serif font-medium text-base text-brand-gold">
          {payNowAmount}
        </span>
      </div>

      <div className="flex justify-between items-center py-1 pt-2.5 border-t border-line/40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-surface2 border border-line flex items-center justify-center text-brand-gold flex-none">
            <Bike className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="font-medium text-xs sm:text-sm text-ink-dark">
              Pay Rider on Delivery
            </div>
            <div className="text-[11px] text-ink-dim font-light">
              Directly to courier (Cash or MoMo)
            </div>
          </div>
        </div>
        <span
          className={`font-serif font-medium text-base ${
            isRiderAmountPending
              ? "text-ink-dim text-xs font-sans font-light"
              : "text-brand-gold-soft"
          }`}
        >
          {payRiderAmount}
        </span>
      </div>

      <p className="text-[11px] text-ink-dim/80 leading-relaxed pt-1 border-t border-line/30 font-light">
        Food is prepaid online to secure preparation. Delivery fee is settled directly with your courier upon delivery.
      </p>
    </div>
  );
}
