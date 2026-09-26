import React from "react";
import type { OrderStatus } from "@/types/database";

export interface OrderStatusStepsProps {
  currentStatus: OrderStatus;
}

interface StepItem {
  id: OrderStatus;
  label: string;
  stepNumber: number;
}

const LIFECYCLE_STEPS: StepItem[] = [
  { id: "confirmed", label: "Order Confirmed", stepNumber: 1 },
  { id: "preparing", label: "Preparing", stepNumber: 2 },
  { id: "ready_for_dispatch", label: "Ready for Dispatch", stepNumber: 3 },
  { id: "dispatched", label: "Dispatched", stepNumber: 4 },
  { id: "delivered", label: "Delivered", stepNumber: 5 },
];

export function OrderStatusSteps({ currentStatus }: OrderStatusStepsProps) {
  if (currentStatus === "cancelled") {
    return (
      <div className="py-4 text-center">
        <div className="w-10 h-10 rounded-full border border-warn text-warn mx-auto flex items-center justify-center font-bold text-lg mb-2">
          ✕
        </div>
        <p className="text-warn font-semibold text-[15px]">Order Cancelled</p>
      </div>
    );
  }

  const currentIndex = LIFECYCLE_STEPS.findIndex((s) => s.id === currentStatus);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0; // If awaiting_payment, index is 0

  return (
    <div className="flex flex-col gap-3.5 my-2">
      {LIFECYCLE_STEPS.map((step, idx) => {
        const isDone = idx <= activeIndex;
        const isCurrent = idx === activeIndex;

        return (
          <div key={step.id} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-[11px] font-semibold flex-none transition-colors ${
                isDone
                  ? "bg-gold border-gold text-ink-on-cream"
                  : "border-line text-ink-dim"
              }`}
            >
              {isDone ? "✓" : step.stepNumber}
            </div>
            <span
              className={`text-[13px] transition-colors ${
                isCurrent
                  ? "text-gold font-bold"
                  : isDone
                  ? "text-ink"
                  : "text-ink-dim"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
