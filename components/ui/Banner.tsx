import React from "react";

export interface BannerProps {
  children: React.ReactNode;
  className?: string;
}

export function Banner({ children, className = "" }: BannerProps) {
  return (
    <div
      className={`bg-surface border border-line rounded-[12px] p-3 text-[12.5px] text-ink-dim leading-relaxed mb-3.5 ${className}`.trim()}
    >
      {children}
    </div>
  );
}
