import React from "react";

export interface StickyCTAProps {
  children: React.ReactNode;
  className?: string;
}

export function StickyCTA({ children, className = "" }: StickyCTAProps) {
  return (
    <div
      className={`sticky bottom-0 bg-gradient-to-t from-bg via-bg/95 to-transparent pt-4 pb-2 mt-2 z-10 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
