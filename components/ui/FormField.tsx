import React from "react";

export interface FormFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  note?: string;
}

export function FormField({
  label,
  error,
  note,
  className = "",
  id,
  ...props
}: FormFieldProps) {
  const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div className="mb-3.5">
      <label
        htmlFor={inputId}
        className="block text-[10px] uppercase tracking-[0.1em] text-gold mb-1.5 font-medium"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full bg-surface2 border border-line rounded-[10px] text-ink px-3 py-2.5 text-[13px] font-sans placeholder:text-ink-dim/50 focus:outline-none focus:border-gold transition-colors ${
          error ? "border-warn focus:border-warn" : ""
        } ${className}`.trim()}
        {...props}
      />
      {error && (
        <p className="text-[11px] text-warn mt-1 font-medium">{error}</p>
      )}
      {note && !error && (
        <p className="text-[10.5px] text-ink-dim mt-1">{note}</p>
      )}
    </div>
  );
}
