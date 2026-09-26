import React from "react";
import { Check } from "lucide-react";

export type CheckoutStep = "cart" | "details" | "delivery" | "payment";

export interface CheckoutStepperProps {
  currentStep: CheckoutStep;
}

const STEPS: { id: CheckoutStep; label: string; number: number }[] = [
  { id: "cart", label: "Cart", number: 1 },
  { id: "details", label: "Details", number: 2 },
  { id: "delivery", label: "Delivery", number: 3 },
  { id: "payment", label: "Payment", number: 4 },
];

export function CheckoutStepper({ currentStep }: CheckoutStepperProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full bg-white border border-brand-cream-dark rounded-2xl p-3 sm:p-4 mb-6 shadow-sm select-none">
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const isPassed = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <React.Fragment key={step.id}>
              {index > 0 && (
                <div
                  className={`h-0.5 flex-1 mx-2 sm:mx-3 transition-colors duration-300 ${
                    isPassed ? "bg-brand-yellow" : "bg-brand-cream-dark"
                  }`}
                />
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                    isPassed
                      ? "bg-brand-yellow text-brand-dark"
                      : isCurrent
                      ? "bg-brand-dark text-white ring-4 ring-brand-yellow/30 shadow-sm"
                      : "bg-brand-cream border border-brand-cream-dark text-brand-muted"
                  }`}
                >
                  {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                </div>
                <span
                  className={`text-[11px] sm:text-xs hidden xs:inline transition-colors ${
                    isCurrent
                      ? "text-brand-dark font-extrabold uppercase"
                      : isPassed
                      ? "text-brand-dark font-medium"
                      : "text-brand-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
