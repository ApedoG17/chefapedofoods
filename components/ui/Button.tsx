import React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "disabled";
  size?: "default" | "sm";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "default",
  fullWidth = true,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  const isActualDisabled = disabled || variant === "disabled";

  const baseStyles =
    "inline-flex items-center justify-center font-semibold transition-colors duration-150 cursor-pointer select-none text-center";

  const sizeStyles =
    size === "sm"
      ? "px-3 py-1.5 text-[11px] rounded-[18px]"
      : "px-4 py-3 text-[13px] rounded-pill";

  const widthStyle = fullWidth ? "w-full" : "w-auto";

  let variantStyles = "";
  if (isActualDisabled) {
    variantStyles =
      "bg-transparent text-ink-dim border border-line opacity-35 pointer-events-none";
  } else if (variant === "ghost") {
    variantStyles =
      "bg-surface2 text-ink border border-line hover:border-brand-gold/60 hover:text-brand-gold active:bg-surface2/80";
  } else {
    // primary
    variantStyles =
      "bg-gold text-ink-on-cream border-[1.5px] border-gold hover:bg-gold-soft hover:border-gold-soft active:opacity-90 shadow-warm-sm";
  }

  return (
    <button
      disabled={isActualDisabled}
      className={`${baseStyles} ${sizeStyles} ${widthStyle} ${variantStyles} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
