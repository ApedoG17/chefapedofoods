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
      className={`bg-[#18110E] border border-white/10 rounded-2xl p-4 sm:p-5 mt-3 shadow-lg space-y-3.5 ${className}`.trim()}
    >
      <div className="flex items-center justify-between pb-2 border-b border-white/10 text-[11px]">
        <span className="text-brand-red font-bold uppercase tracking-wider">
          PAYMENT 1 OF 2
        </span>
        <span className="text-[10px] text-white/50 normal-case font-light">
          Required for fresh morning cooking
        </span>
      </div>

      <div className="flex justify-between items-center py-1">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-brand-yellow flex-none">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <div className="text-white font-black text-xs sm:text-sm uppercase">
              FOOD TOTAL
            </div>
            <div className="text-[11px] text-white/60 font-light">
              Prepaid securely online (Hubtel / MoMo)
            </div>
          </div>
        </div>
        <span className="text-brand-yellow font-black text-base">
          {payNowAmount}
        </span>
      </div>

      <div className="flex justify-between items-center py-1 pt-2.5 border-t border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center text-brand-yellow flex-none">
            <Bike className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-brand-yellow font-bold uppercase tracking-wider mb-0.5">
              PAYMENT 2 OF 2
            </div>
            <div className="text-white font-black text-xs sm:text-sm uppercase">
              DELIVERY FEE (PAY RIDER)
            </div>
            <div className="text-[11px] text-white/60 font-light">
              Directly to courier (Cash or MoMo)
            </div>
          </div>
        </div>
        <span
          className={`font-black text-base ${
            isRiderAmountPending
              ? "text-white/40 text-xs font-sans font-light"
              : "text-brand-yellow"
          }`}
        >
          {payRiderAmount}
        </span>
      </div>

      <p className="text-[11px] text-white/60 leading-relaxed pt-1 border-t border-white/10 font-light">
        Food is prepaid online to secure preparation. Delivery fee is settled directly with your courier upon delivery.
      </p>
    </div>
  );
}
