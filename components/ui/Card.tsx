import React from "react";

export interface CardProps {
  label?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ label, children, className = "" }: CardProps) {
  return (
    <div
      className={`bg-surface border border-line rounded-card p-4 mb-3.5 relative ${className}`.trim()}
    >
      {label && (
        <div className="text-[10px] uppercase tracking-[0.1em] text-gold mb-2.5 font-medium">
          {label}
        </div>
      )}
      {children}
    </div>
  );
}
