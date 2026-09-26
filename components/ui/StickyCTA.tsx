import React from "react";

export interface StickyCTAProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyCTA({ children, className = "" }: StickyCTAProps) {
  return (
    <div
      className={`sticky bottom-0 bg-brand-espresso/95 backdrop-blur-md border-t border-line/50 py-3.5 mt-4 z-20 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
