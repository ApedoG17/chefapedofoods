/**
 * Country Categories & Phone System for Chef Apedo Foods Storefront Forms
 * Supports Ghana (default, strictly 10 digits), West African neighbors, and international categories.
 */

export interface CountryCategory {
  id: string;
  name: string;
  flag: string;
  dialCode: string;
  maxDigits: number;
  minDigits: number;
  placeholder: string;
  example: string;
}

export const COUNTRY_CATEGORIES: CountryCategory[] = [
  {
    id: "GH",
    name: "Ghana",
    flag: "🇬🇭",
    dialCode: "+233",
    maxDigits: 10,
    minDigits: 9,
    placeholder: "024 123 4567",
    example: "024XXXXXXX (10 digits)",
  },
  {
    id: "NG",
    name: "Nigeria",
    flag: "🇳🇬",
    dialCode: "+234",
    maxDigits: 11,
    minDigits: 10,
    placeholder: "080 1234 5678",
    example: "080XXXXXXXX (10-11 digits)",
  },
  {
    id: "CI",
    name: "Côte d'Ivoire",
    flag: "🇨🇮",
    dialCode: "+225",
    maxDigits: 10,
    minDigits: 10,
    placeholder: "07 12 34 56 78",
    example: "10 digits",
  },
  {
    id: "TG",
    name: "Togo",
    flag: "🇹🇬",
    dialCode: "+228",
    maxDigits: 8,
    minDigits: 8,
    placeholder: "90 12 34 56",
    example: "8 digits",
  },
  {
    id: "BJ",
    name: "Benin",
    flag: "🇧🇯",
    dialCode: "+229",
    maxDigits: 10,
    minDigits: 8,
    placeholder: "97 12 34 56",
    example: "8-10 digits",
  },
  {
    id: "GB",
    name: "United Kingdom",
    flag: "🇬🇧",
    dialCode: "+44",
    maxDigits: 11,
    minDigits: 10,
    placeholder: "07123 456789",
    example: "10-11 digits",
  },
  {
    id: "US",
    name: "United States / Canada",
    flag: "🇺🇸",
    dialCode: "+1",
    maxDigits: 10,
    minDigits: 10,
    placeholder: "202 555 0123",
    example: "10 digits",
  },
  {
    id: "OTHER",
    name: "Other Country",
    flag: "🌍",
    dialCode: "+",
    maxDigits: 15,
    minDigits: 7,
    placeholder: "Enter phone number",
    example: "7-15 digits",
  },
];

export const DEFAULT_COUNTRY: CountryCategory = COUNTRY_CATEGORIES[0] as CountryCategory;

/**
 * Extracts and strictly truncates numeric digits according to the country's max digit limit.
 * For Ghana: strictly limits input to a maximum of 10 digits.
 */
export function cleanPhoneDigits(rawInput: string, countryId: string = "GH"): string {
  const country: CountryCategory = COUNTRY_CATEGORIES.find((c) => c.id === countryId) ?? DEFAULT_COUNTRY;
  const digits = rawInput.replace(/\D/g, "");
  return digits.slice(0, country.maxDigits);
}

/**
 * Formats a clean digit string into human-readable phone groupings.
 */
export function formatPhoneNumber(digits: string, countryId: string = "GH"): string {
  if (!digits) return "";

  if (countryId === "GH") {
    // 10-digit format: 0XX XXX XXXX (3-3-4)
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }

  if (countryId === "NG") {
    // 10 or 11-digit format: 0XXX XXX XXXX
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 11)}`;
  }

  if (countryId === "CI" || countryId === "TG" || countryId === "BJ") {
    // Paired groupings: XX XX XX XX
    const parts = digits.match(/.{1,2}/g);
    return parts ? parts.join(" ") : digits;
  }

  if (countryId === "US") {
    // 3-3-4 format: XXX XXX XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  }

  if (countryId === "GB") {
    // UK mobile: 5-6 format: 07XXX XXXXXX
    if (digits.length <= 5) return digits;
    return `${digits.slice(0, 5)} ${digits.slice(5, 11)}`;
  }

  // Other / International: group in chunks of 3 or 4
  return digits.replace(/(\d{3,4})(?=\d)/g, "$1 ");
}
