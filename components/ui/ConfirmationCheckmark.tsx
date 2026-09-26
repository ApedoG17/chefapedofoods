import React from "react";

export function ConfirmationCheckmark() {
  return (
    <div
      aria-label="Success"
      className="w-14 h-14 rounded-full bg-gold text-ink-on-cream flex items-center justify-center text-2xl font-serif font-bold mx-auto mb-3.5 shadow-md select-none"
    >
      ✓
    </div>
  );
}
