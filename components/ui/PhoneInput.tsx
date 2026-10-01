"use client";

import React, { useState, useRef, useEffect } from "react";
import { Check } from "lucide-react";
import {
  COUNTRY_CATEGORIES,
  DEFAULT_COUNTRY,
  type CountryCategory,
  cleanPhoneDigits,
  formatPhoneNumber,
} from "@/lib/validation/countries";

interface PhoneInputProps {
  id?: string;
  value: string;
  onChange: (formattedValue: string, rawDigits: string, country: CountryCategory) => void;
  onBlur?: () => void;
  selectedCountryId?: string;
  onCountryChange?: (country: CountryCategory) => void;
  hasError?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({
  id = "phone-input",
  value,
  onChange,
  onBlur,
  selectedCountryId = "GH",
  onCountryChange,
  hasError = false,
  required = false,
  placeholder,
  className = "",
  disabled = false,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentCountry: CountryCategory =
    COUNTRY_CATEGORIES.find((c) => c.id === selectedCountryId) ?? DEFAULT_COUNTRY;

  const rawDigits = value.replace(/\D/g, "");

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Extract only digits and strictly limit to current country's max digits
    const clean = cleanPhoneDigits(raw, currentCountry.id);
    const formatted = formatPhoneNumber(clean, currentCountry.id);
    onChange(formatted, clean, currentCountry);
  };

  const handleSelectCountry = (country: CountryCategory) => {
    setIsOpen(false);
    if (onCountryChange) {
      onCountryChange(country);
    }
    // Re-truncate existing digits if switching to a country with fewer max digits
    const clean = cleanPhoneDigits(rawDigits, country.id);
    const formatted = formatPhoneNumber(clean, country.id);
    onChange(formatted, clean, country);
  };

  return (
    <div className={`relative flex flex-col space-y-1 ${className}`}>
      <div
        className={`flex items-center rounded-xl bg-brand-cream/50 border transition-all ${
          hasError
            ? "border-brand-red bg-brand-red/5 ring-1 ring-brand-red/20"
            : "border-brand-cream-dark focus-within:border-brand-yellow focus-within:bg-white focus-within:ring-1 focus-within:ring-brand-yellow/30"
        }`}
      >
        {/* Country Selector Dropdown Trigger */}
        <div ref={dropdownRef} className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-3.5 bg-black/5 hover:bg-black/10 border-r border-brand-cream-dark rounded-l-xl text-xs font-bold text-brand-dark transition-colors cursor-pointer select-none"
            aria-label="Select country category"
            title={`${currentCountry.name} (${currentCountry.dialCode})`}
          >
            <span className="text-base leading-none">{currentCountry.flag}</span>
            <span className="font-mono text-xs font-semibold">{currentCountry.dialCode}</span>
            <svg
              className={`w-3.5 h-3.5 text-brand-muted transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Country Selection Menu */}
          {isOpen && (
            <div className="absolute top-full left-0 mt-1.5 w-64 max-h-64 overflow-y-auto bg-white rounded-2xl shadow-xl border border-brand-cream-dark py-1.5 z-50 text-left">
              <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-brand-muted border-b border-brand-cream-dark/60">
                Select Country Category
              </div>
              {COUNTRY_CATEGORIES.map((c) => {
                const isSelected = c.id === currentCountry.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-brand-dark hover:bg-brand-cream transition-colors text-left cursor-pointer ${
                      isSelected ? "bg-brand-yellow/15 font-bold" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{c.flag}</span>
                      <div className="flex flex-col">
                        <span className="text-brand-dark font-medium">{c.name}</span>
                        <span className="text-[10px] text-brand-muted font-mono">
                          {c.dialCode} · {c.example}
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-brand-dark shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Formatted Phone Input */}
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          disabled={disabled}
          required={required}
          value={value}
          onBlur={onBlur}
          onChange={handleInputChange}
          placeholder={placeholder || currentCountry.placeholder}
          className="flex-1 bg-transparent px-3.5 py-3.5 text-sm text-brand-dark outline-none placeholder:text-brand-muted/50 font-medium"
        />

        {/* Counter Badge */}
        <div className="pr-3 flex items-center select-none pointer-events-none">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
              rawDigits.length === currentCountry.maxDigits
                ? "bg-emerald-100 text-emerald-800"
                : rawDigits.length > 0
                ? "bg-brand-cream-dark/60 text-brand-muted"
                : "text-brand-muted/40"
            }`}
          >
            {rawDigits.length}/{currentCountry.maxDigits}
          </span>
        </div>
      </div>
    </div>
  );
}
