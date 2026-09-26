import React from "react";

export interface OptionRowProps {
  label: React.ReactNode;
  rightElement?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function OptionRow({
  label,
  rightElement,
  selected = false,
  disabled = false,
  onClick,
  className = "",
}: OptionRowProps) {
  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`flex justify-between items-center py-2.5 border-b border-line last:border-b-0 text-[13px] ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer select-none hover:bg-surface2/30"
      } ${className}`.trim()}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-4 h-4 rounded-full border-[1.5px] flex-none relative flex items-center justify-center transition-colors ${
            selected ? "border-gold" : "border-ink-dim"
          }`}
        >
          {selected && (
            <div className="w-2 h-2 rounded-full bg-gold" />
          )}
        </div>
        <span className={selected ? "text-ink font-medium" : "text-ink"}>
          {label}
        </span>
      </div>
      {rightElement && (
        <div className="text-right flex items-center">{rightElement}</div>
      )}
    </div>
  );
}
