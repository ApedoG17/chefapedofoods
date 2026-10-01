"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { CheckoutStepper, type CheckoutStep } from "@/components/ui/CheckoutStepper";
import { isAreaServiceable } from "@/lib/delivery";
import { formatGHS } from "@/lib/pricing";
import { EXCLUDED_DELIVERY_AREAS, ORDERING_HOURS } from "@/config/business";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, ArrowLeft, Bike, ShieldCheck, Lock, Clock, Check, CreditCard, Wallet, MapPin, ShoppingBag } from "lucide-react";
import dynamic from "next/dynamic";
import { isValidGhanaPhone, isValidPhoneNumber, isValidFullName } from "@/lib/validation/orders";
import { PhoneInput } from "@/components/ui/PhoneInput";
import { COUNTRY_CATEGORIES } from "@/lib/validation/countries";
import { calculateDistanceETA, getAvailableDeliverySlots } from "@/lib/delivery/eta";
import { calculateDistanceDeliveryFee, CHEF_APEDO_KITCHEN } from "@/lib/delivery/distance";
import type { OperatingHoursStatus } from "@/lib/operating-hours";

// Dynamically import the Leaflet OpenStreetMap picker to avoid SSR "window is not defined" errors
const MapPicker = dynamic(() => import("@/components/MapPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] rounded-2xl bg-brand-cream/50 border-2 border-brand-cream-dark flex items-center justify-center text-xs font-semibold text-brand-muted">
      Loading interactive map...
    </div>
  ),
});

interface ZoneOption {
  name: string;
  areas: string[];
  feePesewas: number;
}

const DEFAULT_ZONES: ZoneOption[] = [
  { name: "Evandy Hostel", areas: ["Evandy Hostel"], feePesewas: 500 },
  { name: "Pentagon", areas: ["Pentagon", "Pentagon Hostel"], feePesewas: 500 },
  { name: "Main Campus (Legon)", areas: ["Main Campus", "Legon Campus", "Balme Library", "Night Market", "Commonwealth", "Sarbah", "Akuafo", "Volta"], feePesewas: 700 },
  { name: "East Legon", areas: ["East Legon", "Shiashie", "Bawaleshie"], feePesewas: 1000 },
  { name: "Airport Residential", areas: ["Airport Residential", "Airport"], feePesewas: 1200 },
  { name: "Osu / Cantonments", areas: ["Osu", "Cantonments", "Labone"], feePesewas: 1500 },
  { name: "Spintex", areas: ["Spintex", "Batsonaa"], feePesewas: 2000 },
];



// ---------------------------------------------------------------------------
// Empty-cart/checkout state with localStorage order recovery
// ---------------------------------------------------------------------------
function CheckoutEmptyState() {
  const router = useRouter();
  const [lastOrderId, setLastOrderId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const stored = localStorage.getItem("last_active_order");
    if (stored) setLastOrderId(stored);
  }, []);

  return (
    <main className="w-full max-w-md mx-auto py-16 sm:py-24 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-white/10 text-brand-yellow flex items-center justify-center mx-auto mb-6 shadow-sm">
        <ShoppingBag className="w-7 h-7 stroke-[2]" />
      </div>
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white uppercase tracking-tight mb-2">
        Your Tray is Empty
      </h1>
      <p className="text-xs sm:text-sm text-white/70 max-w-sm mx-auto leading-relaxed mb-8">
        You haven&apos;t added any meals to your lunch order yet. Choose your favorite meal to begin checkout.
      </p>
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/menu"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-button-yellow"
        >
          <span>Browse Today&apos;s Menu</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </Link>

        {/* Sprint 1 §3: Recovery CTA shown when a recent order exists in localStorage */}
        {lastOrderId && (
          <button
            type="button"
            onClick={() => router.push(`/order/${lastOrderId}`)}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border-2 border-brand-yellow/60 text-brand-yellow font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:bg-brand-yellow/10 transition-all"
          >
            <MapPin className="w-4 h-4 stroke-[2.5]" />
            <span>Track Recent Order</span>
          </button>
        )}
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPesewas, clearCart, isLoaded: isCartLoaded } = useCart();

  // Pinpoint delivery location on OpenStreetMap (Accra default: South Legon / Campus vicinity)
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>({
    lat: CHEF_APEDO_KITCHEN.lat,
    lng: CHEF_APEDO_KITCHEN.lng,
  });

  // Step tracking ("cart", "details", "delivery", "payment")
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("details");

  // Dual-lane payment method selection ('hubtel' | 'manual')
  const [paymentMethod, setPaymentMethod] = useState<"hubtel" | "manual">("hubtel");

  // Form State
  const [fullName, setFullName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("GH");
  const [phone, setPhone] = useState("");
  const [landmark, setLandmark] = useState("");
  const [locationName, setLocationName] = useState<string>("East Legon / UG Campus");

  // Geospatial Distance & Dynamic Pricing Engine
  const distancePricing = React.useMemo(() => {
    if (!deliveryLocation) {
      return calculateDistanceDeliveryFee(CHEF_APEDO_KITCHEN.lat, CHEF_APEDO_KITCHEN.lng);
    }
    return calculateDistanceDeliveryFee(deliveryLocation.lat, deliveryLocation.lng);
  }, [deliveryLocation]);

  const deliveryFeePesewas = distancePricing.feePesewas;
  const isServiceable = distancePricing.isServiceable;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Logistics & Delivery Timing State (Mode 1: ASAP dynamic arrival window, Mode 2: Scheduled 30-min window)
  const [deliveryTimingMode, setDeliveryTimingMode] = useState<"asap" | "scheduled">("asap");
  const [scheduledSlot, setScheduledSlot] = useState<string>("12:30 PM");

  // Server-time Operating Hours Guard (08:00 - 15:00 GMT for ASAP)
  const [asapOperatingStatus, setAsapOperatingStatus] = useState<OperatingHoursStatus | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/operating-hours")
      .then((res) => res.json())
      .then((data: OperatingHoursStatus) => {
        if (isMounted) {
          setAsapOperatingStatus(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch server operating hours:", err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const isAsapClosed = deliveryTimingMode === "asap" && asapOperatingStatus !== null && !asapOperatingStatus.isOpen;

  const currentEta = React.useMemo(
    () => calculateDistanceETA(distancePricing.distanceKm),
    [distancePricing.distanceKm]
  );
  const availableSlots = React.useMemo(() => getAvailableDeliverySlots(), []);

  // Default scheduled slot to first available slot
  useEffect(() => {
    const firstAvailable = availableSlots.find((s) => s.available);
    if (firstAvailable) {
      setScheduledSlot(firstAvailable.label);
    }
  }, [availableSlots]);

  const effectiveDeliverySlot =
    deliveryTimingMode === "asap" ? `ASAP (${currentEta.etaWindow})` : scheduledSlot;

  // Step 1 Validation & Touched States
  const [hasAttemptedStep1, setHasAttemptedStep1] = useState(false);
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const isNameValid = isValidFullName(fullName);
  const dialCode = COUNTRY_CATEGORIES.find((c) => c.id === selectedCountry)?.dialCode || "+233";
  const fullPhoneForValidation =
    selectedCountry === "GH"
      ? phone
      : `${dialCode}${phone.replace(/^0+/, "").replace(/\s+/g, "")}`;
  const isPhoneValid = isValidPhoneNumber(fullPhoneForValidation);
  const isStep1Valid = isNameValid && isPhoneValid;

  // Promo Code Engine State
  const [promoInput, setPromoInput] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ id: string; code: string; percentage: number } | null>(null);

  // Calculate totals dynamically with promo discount
  const baseFoodTotal = subtotalPesewas;
  const discountAmount = appliedPromo ? Math.floor(baseFoodTotal * (appliedPromo.percentage / 100)) : 0;
  const finalFoodTotal = baseFoodTotal - discountAmount;

  const formattedTotal = formatGHS(finalFoodTotal);

  if (!isCartLoaded) {
    return <main className="py-20 text-center text-brand-muted text-sm font-medium">Loading checkout…</main>;
  }

  if (items.length === 0) {
    return <CheckoutEmptyState />;
  }

  // Promo Code Application Handler
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setIsApplyingPromo(true);
    setPromoError("");

    try {
      const res = await fetch("/api/promos/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPromoError(data.error || "Failed to apply code");
        setAppliedPromo(null);
      } else {
        setAppliedPromo({
          id: data.id,
          code: data.code,
          percentage: data.discount_percentage,
        });
        setPromoInput(""); // Clear input on success
      }
    } catch (err) {
      setPromoError("Network error. Try again.");
    } finally {
      setIsApplyingPromo(false);
    }
  };

  // Submission handler
  const handleProceedToPayment = async () => {
    if (isSubmitting) return;
    setErrorMessage(null);
    const gpsCoords = deliveryLocation
      ? `GPS: ${deliveryLocation.lat.toFixed(5)}, ${deliveryLocation.lng.toFixed(5)} · ${distancePricing.distanceKm.toFixed(1)}km`
      : "";
    const resolvedAddress = landmark.trim()
      ? (gpsCoords ? `${landmark.trim()} (${gpsCoords})` : landmark.trim())
      : gpsCoords;

    if (!fullName.trim() || !phone.trim() || !landmark.trim() || !deliveryLocation) {
      setErrorMessage("Please fill in all required fields (Name, Phone, Hostel/House Landmark, and Map Location).");
      return;
    }

    if (!isServiceable) {
      setErrorMessage(
        `Selected location is ${distancePricing.distanceKm.toFixed(1)} km away, exceeding our 15 km fresh delivery radius. Please choose a closer location.`
      );
      return;
    }

    if (isAsapClosed) {
      setErrorMessage(
        asapOperatingStatus?.reason ||
          "ASAP orders are open 8:00 AM to 3:00 PM GMT. Please check back during operating hours or schedule for later."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Route to the new manual order processor
      const response = await fetch("/api/orders/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod,
          promo_code_id: appliedPromo?.id || null,
          original_amount: baseFoodTotal,
          discount_amount: discountAmount,
          items: items.map((i) => ({
            mealId: i.mealId,
            name: i.name,
            size: i.size,
            includedProteinPackageName: i.includedProteinPackageName,
            extras: i.extras || {},
            quantity: i.quantity,
            price: i.basePricePesewas || 0,
          })),
          customerDetails: {
            name: fullName.trim(),
            phone:
              selectedCountry === "GH"
                ? phone.trim()
                : `${dialCode} ${phone.replace(/^0+/, "").trim()}`,
            address: resolvedAddress,
            area: locationName || landmark.trim() || "East Legon / UG Campus",
            notes: landmark.trim() || "",
            deliverySlot: effectiveDeliverySlot,
          },
          subtotal: finalFoodTotal,
          deliveryFee: deliveryFeePesewas,
        }),
      });

      const data = await response.json();

      if (data.success && data.orderId) {
        // ── Sprint 1 §3: Persist the new order ID before clearing cart ──
        // This enables the "Track Recent Order" recovery button on the empty-cart page
        // if the user refreshes before the order page fully loads.
        localStorage.setItem("last_active_order", data.orderId);
        clearCart();
        // Route directly to the order tracking page (server-side fetch, refresh-safe)
        router.push("/order/" + data.orderId);
      } else {
        throw new Error(data.message || "Failed to create order.");
      }
    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      setErrorMessage(err?.message || "Something went wrong processing your order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (isCartLoaded && items.length === 0) {
    return <CheckoutEmptyState />;
  }

  return (
    <main className="w-full max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
      {/* Checkout Stepper */}
      <CheckoutStepper currentStep={currentStep} />

      {/* Step Header */}
      <div className="border-b border-white/10 pb-3">
        <h1 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-brand-red">
          {currentStep === "details" && "Step 1 of 3 · Customer Details"}
          {currentStep === "delivery" && "Step 2 of 3 · Delivery Location & Slot"}
          {currentStep === "payment" && "Step 3 of 3 · Dual-Payment Split"}
        </h1>
        <p className="text-xs sm:text-sm text-white/70 mt-1">
          {currentStep === "details" && "Guest checkout — no password or account needed."}
          {currentStep === "delivery" && "Where and when should we deliver your hot lunch in Accra?"}
          {currentStep === "payment" && "Prepay food online now; pay delivery fee to courier upon arrival."}
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red text-xs font-semibold">
          {errorMessage}
        </div>
      )}

      {/* STEP 1: CUSTOMER DETAILS */}
      {currentStep === "details" && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-cream-dark shadow-sm space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="checkout-fullname" className="block text-xs font-black uppercase tracking-wider text-brand-dark">
                Full Name <span className="text-brand-red">*</span>
              </label>
              {(fullNameTouched || hasAttemptedStep1) && !isNameValid && (
                <span className="text-[11px] text-brand-red font-semibold">
                  Invalid name format
                </span>
              )}
            </div>
            <input
              id="checkout-fullname"
              type="text"
              placeholder="e.g. Kwame Mensah"
              value={fullName}
              maxLength={60}
              onBlur={() => setFullNameTouched(true)}
              onChange={(e) => {
                // Strictly block numeric characters in full name
                const clean = e.target.value.replace(/[0-9]/g, "");
                setFullName(clean);
                if (errorMessage) setErrorMessage(null);
              }}
              className={`w-full bg-brand-cream/50 border rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-muted/50 ${
                (fullNameTouched || hasAttemptedStep1) && !isNameValid
                  ? "border-brand-red focus:border-brand-red bg-brand-red/5 ring-1 ring-brand-red/20"
                  : "border-brand-cream-dark focus:border-brand-yellow focus:bg-white"
              }`}
              required
            />
            {(fullNameTouched || hasAttemptedStep1) && !isNameValid ? (
              <p className="text-[11px] text-brand-red font-medium">
                Please enter a real name (letters only, at least 2 characters, no numbers).
              </p>
            ) : (
              <p className="text-[11px] text-brand-muted">
                Your full name for order pickup and kitchen delivery identification.
              </p>
            )}
          </div>

          {/* Phone Number with Country Categories and 10-digit limiting */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="checkout-phone" className="block text-xs font-black uppercase tracking-wider text-brand-dark">
                Phone Number <span className="text-brand-red">*</span>
              </label>
              {(phoneTouched || hasAttemptedStep1) && !isPhoneValid && (
                <span className="text-[11px] text-brand-red font-semibold">
                  {selectedCountry === "GH" ? "Valid 10-digit number required" : "Valid phone number required"}
                </span>
              )}
            </div>

            <PhoneInput
              id="checkout-phone"
              value={phone}
              selectedCountryId={selectedCountry}
              onCountryChange={(c) => {
                setSelectedCountry(c.id);
                if (errorMessage) setErrorMessage(null);
              }}
              onChange={(formatted) => {
                setPhone(formatted);
                if (errorMessage) setErrorMessage(null);
              }}
              onBlur={() => setPhoneTouched(true)}
              hasError={(phoneTouched || hasAttemptedStep1) && !isPhoneValid}
              required
            />

            {(phoneTouched || hasAttemptedStep1) && !isPhoneValid ? (
              <p className="text-[11px] text-brand-red font-medium">
                {selectedCountry === "GH"
                  ? "Must be a valid 10-digit Ghana mobile number (e.g. 024 123 4567, starting with 02 or 05)."
                  : `Please enter a valid phone number for ${
                      COUNTRY_CATEGORIES.find((c) => c.id === selectedCountry)?.name || "the selected country"
                    }.`}
              </p>
            ) : (
              <p className="text-[11px] text-brand-muted">
                {selectedCountry === "GH"
                  ? "10-digit mobile number used strictly for dispatch courier call upon arrival."
                  : `Used for dispatch courier call (${
                      COUNTRY_CATEGORIES.find((c) => c.id === selectedCountry)?.name
                    }).`}
              </p>
            )}
          </div>

          {/* Action CTA */}
          <div className="pt-4 flex items-center justify-between gap-4 border-t border-brand-cream-dark">
            <Link
              href="/cart"
              className="text-xs font-bold text-brand-muted hover:text-brand-dark inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Cart</span>
            </Link>

            <button
              type="button"
              disabled={!fullName.trim() || !phone.trim() || !isStep1Valid}
              onClick={() => {
                setHasAttemptedStep1(true);
                setFullNameTouched(true);
                setPhoneTouched(true);
                if (!isStep1Valid) {
                  if (!isNameValid) {
                    setErrorMessage("Please enter a valid full name (letters only, e.g. Kwame Mensah).");
                  } else {
                    setErrorMessage("Please enter a valid 10-digit Ghana mobile number (e.g. 024 123 4567).");
                  }
                  return;
                }
                setErrorMessage(null);
                setCurrentStep("delivery");
              }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-40 disabled:pointer-events-none text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow cursor-pointer"
            >
              <span>Continue to Delivery</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DELIVERY DETAILS & SLOT */}
      {currentStep === "delivery" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-cream-dark shadow-sm space-y-5">
            {/* Header */}
            <div className="border-b border-brand-cream-dark pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-brand-dark">
                Pinpoint Delivery Destination
              </h2>
              <p className="text-[11px] text-brand-muted mt-0.5">
                Drop a pin or search your campus hall, hostel, or residence in Accra. Pricing updates dynamically.
              </p>
            </div>

            {/* The Interactive OpenStreetMap */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                  <span>Map Pin &amp; Destination <span className="text-brand-red">*</span></span>
                </label>
                {deliveryLocation && (
                  <span className="text-[10px] font-mono text-brand-muted bg-brand-cream-dark/40 px-2 py-0.5 rounded">
                    GPS: {deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)}
                  </span>
                )}
              </div>

              <MapPicker
                initialLocation={deliveryLocation}
                onLocationSelect={(loc, placeName) => {
                  setDeliveryLocation(loc);
                  if (placeName) {
                    setLocationName(placeName);
                    if (!landmark) {
                      setLandmark(placeName);
                    }
                  }
                }}
              />

              {/* Hidden input to ensure form validation catches missing location */}
              <input
                type="hidden"
                required
                value={deliveryLocation ? `${deliveryLocation.lat},${deliveryLocation.lng}` : ""}
              />
            </div>

            {/* Live Geospatial Distance & Pricing Strip */}
            <div
              className={`p-4 rounded-xl border transition-all ${
                isServiceable
                  ? "bg-amber-50/70 border-brand-yellow/50 text-brand-dark"
                  : "bg-red-50 border-red-200 text-brand-red"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-none ${
                      isServiceable ? "bg-brand-yellow text-brand-dark" : "bg-brand-red text-white"
                    }`}
                  >
                    <Bike className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider flex items-center gap-2">
                      <span>{distancePricing.distanceKm.toFixed(1)} km from East Legon Kitchen</span>
                      {isServiceable ? (
                        <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          In Delivery Range
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold text-brand-red bg-red-100 px-2 py-0.5 rounded-full">
                          Out of Range
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-brand-muted">
                      {isServiceable
                        ? `GH₵ 7.00 base (first 3.0 km) + GH₵ 2.00 per additional km`
                        : `Maximum fresh delivery perimeter is 15.0 km`}
                    </div>
                  </div>
                </div>

                <div className="text-left sm:text-right flex-none border-t sm:border-t-0 pt-2 sm:pt-0 border-black/5">
                  <div className="text-[10px] uppercase font-bold text-brand-muted">
                    Courier Fee (Pay on Delivery)
                  </div>
                  <div
                    className={`text-xl font-display font-black ${
                      isServiceable ? "text-brand-dark" : "text-brand-red"
                    }`}
                  >
                    {isServiceable ? `GH₵ ${distancePricing.feeGHS}` : "Exceeds Range"}
                  </div>
                </div>
              </div>

              {!isServiceable && (
                <p className="text-xs text-brand-red font-bold pt-2 border-t border-red-200 mt-2">
                  Your selected location is {distancePricing.distanceKm.toFixed(1)} km away. To guarantee food arrives hot and fresh, we deliver within 15 km of our central kitchen. Please choose a location within Greater Accra / campus.
                </p>
              )}
            </div>

            {/* Hostel / House Name & Landmark */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-brand-dark">
                Hostel / Room / House Name &amp; Landmark <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Evandy Hostel, Block B, Room 402 (Near main gate)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-brand-cream/50 border border-brand-cream-dark focus:border-brand-yellow focus:bg-white rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-muted/50"
                required
              />
              <p className="text-[11px] text-brand-muted">
                Specific room number, gate description, or building name for your dispatch rider.
              </p>
            </div>
          </div>

          {/* Delivery Slot Card — Dual-Mode Logistics Engine */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-cream-dark shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-brand-cream-dark pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-brand-dark block">
                  Delivery Timing &amp; ETA
                </span>
                <span className="text-[11px] text-brand-muted">
                  Choose fast ASAP preparation or reserve a 30-minute campus delivery window.
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Kitchen Queue</span>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-2 gap-2 bg-brand-cream/60 p-1.5 rounded-xl border border-brand-cream-dark">
              <button
                type="button"
                onClick={() => setDeliveryTimingMode("asap")}
                className={`py-3 px-3 rounded-lg text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-0.5 ${
                  deliveryTimingMode === "asap"
                    ? "bg-brand-yellow text-brand-dark shadow-sm border border-brand-yellow-dark"
                    : "text-brand-dark/70 hover:text-brand-dark hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">⚡</span>
                  <span className="uppercase tracking-wider">ASAP Delivery</span>
                </div>
                <span className="text-[10px] font-semibold opacity-80">
                  {asapOperatingStatus && !asapOperatingStatus.isOpen
                    ? "Closed (8am – 3pm)"
                    : `Estimated: ${currentEta.etaRange}`}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryTimingMode("scheduled")}
                className={`py-3 px-3 rounded-lg text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-0.5 ${
                  deliveryTimingMode === "scheduled"
                    ? "bg-brand-yellow text-brand-dark shadow-sm border border-brand-yellow-dark"
                    : "text-brand-dark/70 hover:text-brand-dark hover:bg-white/50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="uppercase tracking-wider">Schedule Today</span>
                </div>
                <span className="text-[10px] font-semibold opacity-80">
                  Specific 30-min window
                </span>
              </button>
            </div>

            {/* Mode 1: ASAP Live Dynamic Arrival Window or Closed State Notice */}
            {deliveryTimingMode === "asap" && (
              asapOperatingStatus && !asapOperatingStatus.isOpen ? (
                <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border-2 border-brand-yellow/60 text-brand-dark space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-yellow/20 flex items-center justify-center flex-none mt-0.5">
                      <Clock className="w-5 h-5 text-brand-dark" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-black uppercase tracking-wider text-brand-red">
                        ASAP Kitchen Currently Closed
                      </div>
                      <p className="text-xs font-semibold text-brand-dark/90 leading-relaxed">
                        {asapOperatingStatus.reason || "ASAP orders are open 8:00 AM to 3:00 PM GMT. Please check back during operating hours or schedule for later."}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-brand-cream-dark flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[11px] text-brand-muted">Want to reserve a lunch slot in advance?</span>
                    <button
                      type="button"
                      onClick={() => setDeliveryTimingMode("scheduled")}
                      className="px-4 py-2 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-all self-start sm:self-auto cursor-pointer"
                    >
                      Schedule Today&apos;s Slot →
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-amber-50/70 to-yellow-50/40 border border-brand-yellow/40 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-dark/70 bg-white/80 px-2.5 py-1 rounded-md border border-brand-yellow/30">
                      Estimated Arrival Window
                    </span>
                    <span className="text-xs font-bold text-brand-red flex items-center gap-1">
                      <Bike className="w-3.5 h-3.5" />
                      <span>{currentEta.etaRange} total</span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                    <div className="text-2xl sm:text-3xl font-display font-black text-brand-dark tracking-tight">
                      {currentEta.etaWindow}
                    </div>
                    <div className="text-xs font-semibold text-brand-muted">
                      Delivering to <span className="font-bold text-brand-dark">{locationName || "Accra"}</span> ({distancePricing.distanceKm.toFixed(1)} km)
                    </div>
                  </div>

                  {/* Transit Breakdown Pills */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-brand-yellow/20 text-center">
                    <div className="bg-white/90 p-2 rounded-lg border border-brand-yellow/20">
                      <div className="text-[10px] uppercase text-brand-muted font-bold">Kitchen Prep</div>
                      <div className="text-xs font-black text-brand-dark">~{currentEta.prepMinutes} mins</div>
                    </div>
                    <div className="bg-white/90 p-2 rounded-lg border border-brand-yellow/20">
                      <div className="text-[10px] uppercase text-brand-muted font-bold">Zone Transit</div>
                      <div className="text-xs font-black text-brand-dark">~{currentEta.transitMinutes} mins</div>
                    </div>
                    <div className="bg-white/90 p-2 rounded-lg border border-brand-yellow/20">
                      <div className="text-[10px] uppercase text-brand-muted font-bold">Handover Buffer</div>
                      <div className="text-xs font-black text-brand-dark">~5-10 mins</div>
                    </div>
                  </div>

                  <p className="text-[11px] text-brand-muted leading-relaxed">
                    Cooked to order upon payment confirmation and immediately dispatched with your assigned campus rider.
                  </p>
                </div>
              )
            )}

            {/* Mode 2: Scheduled 30-min Windows with Time Guard */}
            {deliveryTimingMode === "scheduled" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {availableSlots.map((slot) => {
                    const isSelected = scheduledSlot === slot.label;
                    const isAvailable = slot.available;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => {
                          if (isAvailable) setScheduledSlot(slot.label);
                        }}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          !isAvailable
                            ? "bg-brand-cream/30 border-brand-cream-dark/60 text-brand-muted/40 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-brand-yellow border-brand-yellow-dark text-brand-dark font-black shadow-sm"
                            : "bg-brand-cream/50 border-brand-cream-dark text-brand-dark hover:bg-brand-cream font-bold cursor-pointer"
                        }`}
                      >
                        <div className="text-xs sm:text-sm font-display">{slot.label}</div>
                        <div className="text-[9px] uppercase tracking-wider mt-0.5 font-bold">
                          {isAvailable ? (
                            <span className={isSelected ? "text-brand-dark font-extrabold" : "text-emerald-600"}>
                              {isSelected ? "Selected" : "Available"}
                            </span>
                          ) : (
                            <span className="text-brand-muted/60">Passed</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <p className="text-[11px] text-brand-muted">
                  Time Guard locks past slots to guarantee food arrives hot and freshly cooked.
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => setCurrentStep("details")}
              className="text-xs font-bold text-brand-muted hover:text-brand-dark inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Details</span>
            </button>

            <button
              type="button"
              disabled={!isServiceable || !landmark.trim()}
              onClick={() => setCurrentStep("payment")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-40 disabled:pointer-events-none text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: THE DUAL-PAYMENT SPLIT INTERFACE */}
      {currentStep === "payment" && (
        <div className="space-y-6">
          {/* Order Summary Strip */}
          <div className="bg-white rounded-2xl p-5 border border-brand-cream-dark shadow-sm flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-brand-dark">Delivering to:</span>{" "}
              <span className="text-brand-muted">{fullName} ({phone}) · {landmark}{locationName ? `, ${locationName}` : ""} ({distancePricing.distanceKm.toFixed(1)} km)</span>
            </div>
            <div className="font-bold text-brand-red flex-none pl-2">
              Slot: {effectiveDeliverySlot}
            </div>
          </div>

          {/* Payment Clarity Box */}
          <div className="bg-[#FAF5EE] border border-black/5 rounded-xl p-5 mb-6 text-sm text-[#18110E]">
            <h4 className="font-black uppercase tracking-wider mb-2 text-xs text-black/50">
              Payment Clarity:
            </h4>
            <ol className="space-y-2 list-decimal list-inside text-black/80 font-medium">
              {paymentMethod === 'hubtel' ? (
                <>
                  <li>
                    You pay <span className="font-bold text-black">{formattedTotal}</span> now online via Hubtel (MoMo or Card) to secure kitchen preparation.
                  </li>
                  <li>
                    You pay the delivery fee directly to the courier when your food arrives.
                  </li>
                </>
              ) : (
                <>
                  <li>
                    You pay <span className="font-bold text-black">{formattedTotal}</span> either by manual MoMo transfer or cash directly to the dispatch rider upon arrival.
                  </li>
                  <li>
                    The delivery fee is settled with the courier along with your meal.
                  </li>
                </>
              )}
            </ol>
          </div>

          {/* Promo Code Block */}
          <div className="bg-[#141414] border border-white/5 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-bold mb-3 uppercase tracking-wider text-sm">Have a Promo Code?</h3>
            
            {appliedPromo ? (
              <div className="flex items-center justify-between bg-brand-yellow/10 border border-brand-yellow/20 p-4 rounded-xl">
                <div>
                  <p className="text-brand-yellow font-black uppercase">{appliedPromo.code} APPLIED</p>
                  <p className="text-brand-yellow/80 text-sm">-{appliedPromo.percentage}% off food total ({formatGHS(discountAmount)} saved)</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setAppliedPromo(null)}
                  className="text-white/50 hover:text-brand-red transition-colors text-sm font-bold uppercase cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white uppercase focus:border-brand-yellow focus:ring-1 focus:ring-brand-yellow outline-none transition-all placeholder:text-white/30 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    disabled={isApplyingPromo || !promoInput.trim()}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold uppercase px-6 rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-sm"
                  >
                    {isApplyingPromo ? "..." : "Apply"}
                  </button>
                </div>
                {promoError && <p className="text-brand-red text-xs mt-2 font-bold">{promoError}</p>}
              </div>
            )}
          </div>

          {/* CARD 1: PAY NOW (Food Total) */}
          <div className="bg-[#18110E] border-2 border-brand-yellow/40 rounded-3xl p-5 sm:p-8 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] text-brand-red font-bold uppercase tracking-[0.2em]">
                  Payment 1 of 2 · Immediate Online Prepayment
                </span>
                <h3 className="font-display text-white font-black text-xl sm:text-2xl md:text-3xl uppercase tracking-tight mt-0.5">
                  Food Total (Pay Now)
                </h3>
              </div>
              <div className="font-display text-brand-yellow font-black text-2xl sm:text-3xl text-left sm:text-right">
                {appliedPromo && (
                  <span className="block text-xs line-through text-white/50 font-normal">
                    {formatGHS(baseFoodTotal)}
                  </span>
                )}
                <span>{formatGHS(finalFoodTotal)}</span>
              </div>
            </div>

            {/* Payment Method Badges */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Instant Payment Methods Supported:
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-white">
                <span className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10 shadow-xs flex items-center gap-1.5 text-white">
                  <span className="w-2 h-2 rounded-full bg-brand-yellow" />
                  <span>MTN Mobile Money</span>
                </span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10 shadow-xs flex items-center gap-1.5 text-white">
                  <span className="w-2 h-2 rounded-full bg-brand-red" />
                  <span>Telecel Cash</span>
                </span>
                <span className="bg-white/10 px-3 py-1.5 rounded-full border border-white/10 shadow-xs flex items-center gap-1.5 text-white">
                  <CreditCard className="w-3 h-3 text-brand-yellow" />
                  <span>Debit / Credit Card</span>
                </span>
              </div>
              <p className="text-xs text-white/60 pt-1">
                Processed with 256-bit bank encryption in Ghanaian Cedis (GHS).
              </p>
            </div>

            {/* --- PAYMENT METHOD SELECTION --- */}
            <div className="mt-8 mb-4">
              <h3 className="text-sm font-black tracking-wide text-white mb-3 uppercase">
                Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: Hubtel */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('hubtel')}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'hubtel' 
                      ? 'border-brand-yellow bg-brand-yellow/20 shadow-xs' 
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className={paymentMethod === 'hubtel' ? 'text-brand-yellow' : 'text-white/40'} size={24} />
                    <span className="font-bold text-white">Pay Online (Hubtel)</span>
                  </div>
                  <p className="text-xs text-white/70 pl-9 leading-relaxed">
                    Securely pay via MTN MoMo, Telecel Cash, ATMoney, or Bank Card right now.
                  </p>
                  {/* Active Indicator */}
                  {paymentMethod === 'hubtel' && (
                    <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-brand-yellow" />
                  )}
                </button>

                {/* Option B: Manual / Cash on Delivery */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('manual')}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'manual' 
                      ? 'border-brand-yellow bg-brand-yellow/20 shadow-xs' 
                      : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Wallet className={paymentMethod === 'manual' ? 'text-brand-yellow' : 'text-white/40'} size={24} />
                    <span className="font-bold text-white">Manual MoMo / Cash</span>
                  </div>
                  <p className="text-xs text-white/70 pl-9 leading-relaxed">
                    Send MoMo directly to our merchant line, or pay the rider exact cash upon delivery.
                  </p>
                  {/* Active Indicator */}
                  {paymentMethod === 'manual' && (
                    <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-brand-yellow" />
                  )}
                </button>
              </div>
            </div>

            {/* Main Action CTA */}
            <div className="pt-2 space-y-3">
              {isAsapClosed && (
                <div className="p-4 rounded-xl bg-amber-500/20 border border-brand-yellow/40 text-brand-yellow text-xs font-semibold flex items-start gap-2.5">
                  <Clock className="w-4 h-4 shrink-0 text-brand-yellow mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-extrabold text-white block uppercase tracking-wider">
                      ASAP Orders Currently Closed
                    </span>
                    <span className="text-white/80 leading-relaxed block">
                      {asapOperatingStatus?.reason ||
                        "ASAP orders are open 8:00 AM to 3:00 PM GMT. Please check back during operating hours or schedule for later."}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isSubmitting || !isServiceable || isAsapClosed}
                onClick={handleProceedToPayment}
                className="w-full inline-flex items-center justify-center gap-3 py-4 sm:py-5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-50 text-brand-dark font-extrabold text-sm sm:text-base uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow cursor-pointer disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : isAsapClosed ? (
                  <span>ASAP Closed (Open 8:00 AM – 3:00 PM GMT)</span>
                ) : (
                  <>
                    <span>Confirm Order &amp; View Instructions ➔</span>
                  </>
                )}
              </button>
              <p className="text-center text-xs text-white/60 leading-relaxed px-2">
                By placing this order, you agree to our{" "}
                <Link href="/legal/terms" className="underline hover:text-brand-yellow transition-colors font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/legal/privacy" className="underline hover:text-brand-yellow transition-colors font-medium">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          {/* CARD 2: PAY RIDER (Delivery Fee) */}
          <div className="bg-[#18110E] border border-white/10 rounded-3xl p-5 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-brand-yellow shadow-xs flex-none">
                  <Bike className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] text-brand-yellow font-bold uppercase tracking-[0.2em]">
                    Payment 2 of 2 · Upon Arrival
                  </span>
                  <h3 className="font-display font-black text-lg sm:text-xl md:text-2xl text-white uppercase tracking-tight mt-0.5">
                    Delivery Fee (Pay Rider)
                  </h3>
                </div>
              </div>
              <div className="font-display text-brand-yellow font-black text-2xl sm:text-3xl text-left sm:text-right">
                {formatGHS(deliveryFeePesewas)}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-white/70 leading-relaxed">
              <p>
                <strong className="text-white">Protocol:</strong> Hand this exact amount directly to your dispatch courier when your hot lunch arrives at your doorstep ({distancePricing.distanceKm.toFixed(1)} km from central kitchen).
              </p>
              <p>
                Riders accept <strong className="text-white">Cash</strong> or direct <strong className="text-white">Mobile Money</strong> on arrival.
              </p>
            </div>
          </div>

          {/* Trust Elements */}
          <div className="flex items-center justify-center gap-2 text-xs text-brand-muted pt-2">
            <Lock className="w-3.5 h-3.5" />
            <span>256-bit bank encryption · Secure Hubtel &amp; Direct Ghana Checkout</span>
          </div>

          {/* Back Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setCurrentStep("delivery")}
              className="text-xs font-bold text-brand-muted hover:text-brand-dark inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Delivery Details</span>
            </button>
          </div>
        </div>
      )}

      {/* Frequently Asked Questions Accordion */}
      <div className="mt-12 bg-[#141414] border border-gray-800 rounded-2xl p-6">
        <h3 className="text-xl font-black text-brand-yellow uppercase tracking-wider mb-6">
          Frequently Asked Questions
        </h3>
        
        <div className="space-y-4">
          <div className="pb-4 border-b border-gray-800">
            <p className="text-sm font-bold text-white uppercase mb-1">When will my food arrive?</p>
            <p className="text-sm text-gray-400">Our kitchen prepares meals fresh. Once your order hits &quot;Out for Delivery,&quot; our rider will arrive at your Legon/East Legon location within 15–25 minutes.</p>
          </div>
          
          <div className="pb-4 border-b border-gray-800">
            <p className="text-sm font-bold text-white uppercase mb-1">How does the delivery fee work?</p>
            <p className="text-sm text-gray-400">To keep our food prices low, you pay the exact delivery fee directly to the dispatch rider via Cash or MoMo upon arrival. The food total is paid online to confirm the kitchen order.</p>
          </div>
          
          <div className="pt-2">
            <p className="text-sm font-bold text-white uppercase mb-1">Can I cancel my order?</p>
            <p className="text-sm text-gray-400">You can cancel for a full refund only while the status is &quot;Order Received.&quot; Once the kitchen begins cooking (Preparing), cancellations are no longer accepted.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
