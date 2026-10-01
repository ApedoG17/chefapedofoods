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
import { isValidGhanaPhone, isValidFullName } from "@/lib/validation/orders";

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

const DELIVERY_SLOTS = [
  { id: "11:30", label: "11:30 AM", available: true },
  { id: "12:30", label: "12:30 PM", available: true },
  { id: "13:30", label: "1:30 PM", available: true },
  { id: "14:30", label: "2:30 PM", available: true },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalPesewas, clearCart, isLoaded: isCartLoaded } = useCart();

  // Pinpoint delivery location on OpenStreetMap (Accra default: East Legon / Legon campus vicinity)
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number } | null>({
    lat: 5.6505,
    lng: -0.1870,
  });

  // Step tracking ("cart", "details", "delivery", "payment")
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("details");

  // Dual-lane payment method selection ('hubtel' | 'manual')
  const [paymentMethod, setPaymentMethod] = useState<"hubtel" | "manual">("hubtel");

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedArea, setSelectedArea] = useState("East Legon");
  const [customArea, setCustomArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("11:30 AM");

  // Step 1 Validation & Touched States
  const [hasAttemptedStep1, setHasAttemptedStep1] = useState(false);
  const [fullNameTouched, setFullNameTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  const isNameValid = isValidFullName(fullName);
  const isPhoneValid = isValidGhanaPhone(phone);
  const isStep1Valid = isNameValid && isPhoneValid;

  // Operational / Zone State
  const [zones, setZones] = useState<ZoneOption[]>(DEFAULT_ZONES);
  const [deliveryFeePesewas, setDeliveryFeePesewas] = useState(1000);
  const [isServiceable, setIsServiceable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Fetch active delivery zones from Supabase
  useEffect(() => {
    async function loadZones() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("delivery_zones")
          .select("name, areas, fee_pesewas, active")
          .eq("active", true);

        if (data && !error && data.length > 0) {
          const mapped: ZoneOption[] = data.map((z) => ({
            name: z.name,
            areas: z.areas,
            feePesewas: z.fee_pesewas,
          }));
          setZones(mapped);
        }
      } catch (err) {
        console.warn("Could not load zones:", err);
      }
    }
    loadZones();
  }, []);

  // Update serviceability and fee whenever selectedArea or customArea changes
  useEffect(() => {
    const areaToCheck = selectedArea === "Other" ? customArea : selectedArea;
    const serviceable = isAreaServiceable(areaToCheck);
    setIsServiceable(serviceable);

    if (!serviceable) {
      setDeliveryFeePesewas(0);
      return;
    }

    // Match zone
    const norm = areaToCheck.trim().toLowerCase();
    let fee = 1000;
    for (const z of zones) {
      if (z.areas.some((a) => a.toLowerCase() === norm)) {
        fee = z.feePesewas;
        break;
      }
    }
    setDeliveryFeePesewas(fee);
  }, [selectedArea, customArea, zones]);

  if (!isCartLoaded) {
    return <main className="py-20 text-center text-brand-muted text-sm font-medium">Loading checkout…</main>;
  }

  if (items.length === 0) {
    return (
      <main className="py-16 text-center max-w-md mx-auto px-4 space-y-4">
        <h1 className="font-display font-extrabold text-2xl text-brand-dark uppercase">
          Your Cart is Empty
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted">
          Add a meal to your cart to begin checkout.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-yellow text-brand-dark font-extrabold text-xs uppercase tracking-wider"
        >
          <span>Return to Menu</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
    );
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
    setErrorMessage(null);
    const activeArea = selectedArea === "Other" ? customArea : selectedArea;
    const gpsCoords = deliveryLocation
      ? `GPS: ${deliveryLocation.lat.toFixed(5)}, ${deliveryLocation.lng.toFixed(5)}`
      : "";
    const resolvedAddress = landmark.trim()
      ? (gpsCoords ? `${landmark.trim()} (${gpsCoords})` : landmark.trim())
      : gpsCoords;

    if (!fullName.trim() || !phone.trim() || !landmark.trim() || !activeArea.trim()) {
      setErrorMessage("Please fill in all required fields (Name, Phone, Area, and Hostel/House Name).");
      return;
    }

    if (!isServiceable) {
      setErrorMessage("The selected delivery area is outside our service coverage.");
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
            phone: phone.trim(),
            address: resolvedAddress,
            area: activeArea.trim(),
            notes: landmark.trim() || "",
            deliverySlot,
          },
          subtotal: finalFoodTotal,
          deliveryFee: deliveryFeePesewas,
        }),
      });

      const data = await response.json();

      if (data.success && data.orderId) {
        clearCart();
        // Redirect directly to the order confirmation page
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
        <Link
          href="/menu"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-button-yellow"
        >
          <span>Browse Today&apos;s Menu</span>
          <ArrowRight className="w-4 h-4 stroke-[3]" />
        </Link>
      </main>
    );
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
              onBlur={() => setFullNameTouched(true)}
              onChange={(e) => {
                setFullName(e.target.value);
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
                Please enter a real name (at least 2 letters, no numbers like 8584).
              </p>
            ) : (
              <p className="text-[11px] text-brand-muted">
                Your full name for order pickup and kitchen delivery identification.
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="checkout-phone" className="block text-xs font-black uppercase tracking-wider text-brand-dark">
                Ghana Phone Number <span className="text-brand-red">*</span>
              </label>
              {(phoneTouched || hasAttemptedStep1) && !isPhoneValid && (
                <span className="text-[11px] text-brand-red font-semibold">
                  Valid Ghana number required
                </span>
              )}
            </div>
            <input
              id="checkout-phone"
              type="tel"
              placeholder="e.g. 024 123 4567 or 050 123 4567"
              value={phone}
              onBlur={() => setPhoneTouched(true)}
              onChange={(e) => {
                // Sanitize input in real-time: keep only digits, spaces, +, and -
                const clean = e.target.value.replace(/[^0-9+\s\-]/g, "");
                setPhone(clean);
                if (errorMessage) setErrorMessage(null);
              }}
              className={`w-full bg-brand-cream/50 border rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-muted/50 ${
                (phoneTouched || hasAttemptedStep1) && !isPhoneValid
                  ? "border-brand-red focus:border-brand-red bg-brand-red/5 ring-1 ring-brand-red/20"
                  : "border-brand-cream-dark focus:border-brand-yellow focus:bg-white"
              }`}
              required
            />
            {(phoneTouched || hasAttemptedStep1) && !isPhoneValid ? (
              <p className="text-[11px] text-brand-red font-medium">
                Must be a valid 10-digit Ghana mobile number (MTN, Telecel, AT starting with 02 or 05).
              </p>
            ) : (
              <p className="text-[11px] text-brand-muted">
                Used strictly for dispatch courier call upon arrival.
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
            {/* Delivery Area Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-brand-dark">
                Delivery Area <span className="text-brand-red">*</span>
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full bg-brand-cream/50 border border-brand-cream-dark focus:border-brand-yellow focus:bg-white rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all"
              >
                <optgroup label="Serviceable Delivery Zones (Accra)">
                  {zones.flatMap((z) =>
                    z.areas.map((area) => (
                      <option key={area} value={area}>
                        {area} — Rider Fee: {formatGHS(z.feePesewas)}
                      </option>
                    ))
                  )}
                </optgroup>
                <optgroup label="Excluded Areas (Unserviceable)">
                  {EXCLUDED_DELIVERY_AREAS.map((ex) => (
                    <option key={ex} value={ex}>
                      {ex} (Outside coverage)
                    </option>
                  ))}
                </optgroup>
                <option value="Other">Other / Type manually</option>
              </select>

              {selectedArea === "Other" && (
                <div className="pt-2">
                  <input
                    type="text"
                    placeholder="Type your area in Accra (e.g. Airport Residential)"
                    value={customArea}
                    onChange={(e) => setCustomArea(e.target.value)}
                    className="w-full bg-brand-cream/50 border border-brand-cream-dark focus:border-brand-yellow focus:bg-white rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all"
                  />
                </div>
              )}

              {!isServiceable ? (
                <p className="text-xs text-brand-red font-bold pt-1">
                  We cannot serve this location to guarantee food arrives hot. Please choose an address in central Accra.
                </p>
              ) : (
                <p className="text-xs text-brand-muted pt-1 flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-brand-yellow-dark" />
                  <span>Delivery fee: <strong className="text-brand-dark font-bold">{formatGHS(deliveryFeePesewas)}</strong> — paid directly to rider on arrival.</span>
                </p>
              )}
            </div>

            {/* The Interactive OpenStreetMap */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-brand-dark flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-brand-red" />
                  <span>Pinpoint Your Location <span className="text-brand-red">*</span></span>
                </label>
                {deliveryLocation && (
                  <span className="text-[10px] font-mono text-brand-muted bg-brand-cream-dark/40 px-2 py-0.5 rounded">
                    GPS: {deliveryLocation.lat.toFixed(4)}, {deliveryLocation.lng.toFixed(4)}
                  </span>
                )}
              </div>
              <p className="text-xs text-brand-muted">
                Tap on the map to drop a pin exactly where you want your food delivered in Accra.
              </p>
              
              <MapPicker
                initialLocation={deliveryLocation}
                onLocationSelect={(loc, placeName) => {
                  setDeliveryLocation(loc);
                  if (placeName) {
                    setLandmark(placeName);
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

            {/* Hostel / House Name & Landmark */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-brand-dark">
                Hostel / House Name &amp; Landmark <span className="text-brand-red">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Evandy Hostel, Room 402 (Near the main gate)"
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

          {/* Delivery Slot Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-brand-cream-dark shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-brand-cream-dark pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-brand-dark">
                Select Lunch Delivery Slot
              </span>
              <span className="text-xs text-brand-muted">First slot: {ORDERING_HOURS.firstDeliverySlot} GMT</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {DELIVERY_SLOTS.map((slot) => {
                const isSelected = deliverySlot === slot.label;
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setDeliverySlot(slot.label)}
                    className={`p-3.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? "bg-brand-yellow border-brand-yellow-dark text-brand-dark font-black shadow-sm"
                        : "bg-brand-cream/50 border-brand-cream-dark text-brand-dark hover:bg-brand-cream font-bold"
                    }`}
                  >
                    <div className="text-sm font-display">{slot.label}</div>
                    <div className="text-[10px] text-brand-dark/70 uppercase tracking-wider mt-0.5">
                      Available
                    </div>
                  </button>
                );
              })}
            </div>
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
              <span className="text-brand-muted">{fullName} ({phone}) · {landmark}, {selectedArea === "Other" ? customArea : selectedArea}</span>
            </div>
            <div className="font-bold text-brand-red flex-none pl-2">
              Slot: {deliverySlot}
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
              <button
                type="button"
                disabled={isSubmitting || !isServiceable}
                onClick={handleProceedToPayment}
                className="w-full inline-flex items-center justify-center gap-3 py-4 sm:py-5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-50 text-brand-dark font-extrabold text-sm sm:text-base uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
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
                <strong className="text-white">Protocol:</strong> Hand this exact amount directly to your dispatch courier when your hot lunch arrives at your doorstep in {selectedArea === "Other" ? customArea : selectedArea}.
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
