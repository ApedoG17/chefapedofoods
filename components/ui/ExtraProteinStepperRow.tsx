import React from "react";

export interface ExtraProteinStepperRowProps {
  name: string;
  priceFormatted: string;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  className?: string;
}

export function ExtraProteinStepperRow({
  name,
  priceFormatted,
  quantity,
  onIncrement,
  onDecrement,
  className = "",
}: ExtraProteinStepperRowProps) {
  return (
    <div
      className={`flex justify-between items-center py-2.5 border-b border-line last:border-b-0 text-[13px] ${className}`.trim()}
    >
      <div>
        <span className="text-ink">{name}</span>{" "}
        <span className="text-gold font-medium">+{priceFormatted}</span>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label={`Decrease ${name}`}
          onClick={onDecrement}
          disabled={quantity <= 0}
          className="w-6 h-6 border border-line rounded-lg text-center flex items-center justify-center text-ink cursor-pointer hover:border-gold hover:text-gold disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          −
        </button>
        <span className="w-4 text-center font-medium text-ink">{quantity}</span>
        <button
          type="button"
          aria-label={`Increase ${name}`}
          onClick={onIncrement}
          className="w-6 h-6 border border-line rounded-lg text-center flex items-center justify-center text-ink cursor-pointer hover:border-gold hover:text-gold active:bg-gold/10 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
