import React from "react";

export interface BadgeProps {
  variant?: "ok" | "warn" | "neutral";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Badge({
  variant = "ok",
  children,
  className = "",
  onClick,
}: BadgeProps) {
  let variantStyles = "";
  if (variant === "ok") {
    variantStyles = "border-ok text-ok";
  } else if (variant === "warn") {
    variantStyles = "border-warn text-warn";
  } else {
    variantStyles = "border-line text-ink-dim";
  }

  const clickableStyles = onClick ? "cursor-pointer select-none" : "";

  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-pill text-[9.5px] border ${variantStyles} ${clickableStyles} ${className}`.trim()}
    >
      {children}
    </span>
  );
}
