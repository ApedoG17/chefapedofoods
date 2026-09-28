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
import { ArrowRight, ArrowLeft, Bike, ShieldCheck, Lock, Clock, Check, CreditCard, Wallet } from "lucide-react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

// Define the libraries array outside the component to prevent re-renders
const libraries: ("places")[] = ["places"];

interface ZoneOption {
  name: string;
  areas: string[];
  feePesewas: number;
}

const DEFAULT_ZONES: ZoneOption[] = [
  { name: "Zone A (East Legon)", areas: ["East Legon", "Shiashie"], feePesewas: 1000 },
  { name: "Zone B (Osu / Cantonments)", areas: ["Osu", "Cantonments", "Labone"], feePesewas: 1500 },
  { name: "Zone C (Spintex)", areas: ["Spintex", "Batsonaa"], feePesewas: 2000 },
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

  // Google Maps Autocomplete setup
  const [autocompleteRef, setAutocompleteRef] = useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded: isMapLoaded, loadError: mapLoadError } = useLoadScript({
    googleMapsApiKey: (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string) || "",
    libraries,
  });

  const handlePlaceChanged = () => {
    if (autocompleteRef !== null) {
      const place = autocompleteRef.getPlace();
      const formatted = place.formatted_address || place.name;
      if (formatted) {
        setDeliveryAddress(formatted);
      }
    }
  };

  // Step tracking ("cart", "details", "delivery", "payment")
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("details");

  // Dual-lane payment method selection ('hubtel' | 'manual')
  const [paymentMethod, setPaymentMethod] = useState<"hubtel" | "manual">("hubtel");

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedArea, setSelectedArea] = useState("East Legon");
  const [customArea, setCustomArea] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("11:30 AM");

  // Operational / Zone State
  const [zones, setZones] = useState<ZoneOption[]>(DEFAULT_ZONES);
  const [deliveryFeePesewas, setDeliveryFeePesewas] = useState(1000);
  const [isServiceable, setIsServiceable] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formattedTotal = formatGHS(subtotalPesewas);

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

  // Submission handler
  const handleProceedToPayment = async () => {
    setErrorMessage(null);
    const activeArea = selectedArea === "Other" ? customArea : selectedArea;

    if (!fullName.trim() || !phone.trim() || !deliveryAddress.trim() || !activeArea.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (!isServiceable) {
      setErrorMessage("The selected delivery area is outside our service coverage.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "manual") {
        // --- PHASE 2: MANUAL BYPASS ---
        const response = await fetch("/api/orders/manual", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
              address: deliveryAddress.trim(),
              area: activeArea.trim(),
              notes: landmark.trim() || "",
              deliverySlot,
            },
            subtotal: subtotalPesewas,
            deliveryFee: deliveryFeePesewas,
          }),
        });

        const result = await response.json();

        if (result.success && result.orderId) {
          clearCart();
          // Redirect directly to the live tracking page
          router.push(`/order/${result.orderId}`);
        } else {
          throw new Error(result.message || "Failed to create order.");
        }
      } else {
        // --- PHASE 3: HUBTEL API CALL ---
        const response = await fetch("/api/payments/hubtel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
              address: deliveryAddress.trim(),
              area: activeArea.trim(),
              notes: landmark.trim() || "",
              deliverySlot,
            },
            subtotal: subtotalPesewas,
            deliveryFee: deliveryFeePesewas,
          }),
        });

        const result = await response.json();

        if (result.success && result.checkoutUrl) {
          clearCart();
          // Redirect the user to the secure Hubtel payment page
          window.location.href = result.checkoutUrl;
        } else {
          throw new Error(
            result.message || "Failed to initialize Hubtel checkout. Please try Manual MoMo / Cash."
          );
        }
      }
    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      setErrorMessage(err?.message || "Something went wrong processing your order. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
      {/* Checkout Stepper */}
      <CheckoutStepper currentStep={currentStep} />

      {/* Step Header */}
      <div className="border-b border-brand-cream-dark pb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
          {currentStep === "details" && "Step 1 of 3 · Customer Details"}
          {currentStep === "delivery" && "Step 2 of 3 · Delivery Location & Slot"}
          {currentStep === "payment" && "Step 3 of 3 · Dual-Payment Split"}
        </span>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark uppercase tracking-tight mt-0.5">
          {currentStep === "details" && "Your Details"}
          {currentStep === "delivery" && "Delivery Address & Slot"}
          {currentStep === "payment" && "Review & Complete Payment"}
        </h1>
        <p className="text-xs sm:text-sm text-brand-muted mt-1">
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
            <label className="block text-xs font-black uppercase tracking-wider text-brand-dark">
              Full Name <span className="text-brand-red">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Kwame Mensah"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-brand-cream/50 border border-brand-cream-dark focus:border-brand-yellow focus:bg-white rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-muted/50"
              required
            />
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-brand-dark">
              Ghana Phone Number <span className="text-brand-red">*</span>
            </label>
            <input
              type="tel"
              placeholder="e.g. 024 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-brand-cream/50 border border-brand-cream-dark focus:border-brand-yellow focus:bg-white rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-muted/50"
              required
            />
            <p className="text-[11px] text-brand-muted">
              Used strictly for courier call upon arrival.
            </p>
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
              disabled={!fullName.trim() || !phone.trim()}
              onClick={() => setCurrentStep("delivery")}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-40 disabled:pointer-events-none text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow"
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

            {/* Street Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-brand-dark">
                Street Address &amp; House Number <span className="text-brand-red">*</span>
              </label>

              {isMapLoaded ? (
                <Autocomplete
                  onLoad={(ref) => setAutocompleteRef(ref)}
                  onPlaceChanged={handlePlaceChanged}
                  // Restrict autocomplete to Ghana
                  options={{ componentRestrictions: { country: "gh" } }}
                >
                  <input
                    type="text"
                    placeholder="e.g. 14 Boundary Road, East Legon"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full bg-brand-cream/50 border border-brand-cream-dark focus:border-brand-yellow focus:bg-white rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-muted/50"
                    required
                  />
                </Autocomplete>
              ) : mapLoadError || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.includes("your_actual") ? (
                <input
                  type="text"
                  placeholder="e.g. 14 Boundary Road, East Legon"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-brand-cream/50 border border-brand-cream-dark focus:border-brand-yellow focus:bg-white rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-muted/50"
                  required
                />
              ) : (
                // Fallback while loading
                <input
                  type="text"
                  placeholder="Loading map data..."
                  disabled
                  className="w-full bg-brand-cream/50 border border-brand-cream-dark rounded-xl p-3.5 text-sm text-brand-muted bg-black/5 cursor-not-allowed"
                />
              )}
            </div>

            {/* Landmark */}
            <div className="space-y-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-brand-dark">
                Landmark / Directions
              </label>
              <input
                type="text"
                placeholder="e.g. Near Starbites, opposite yellow gate"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                className="w-full bg-brand-cream/50 border border-brand-cream-dark focus:border-brand-yellow focus:bg-white rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-muted/50"
              />
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
              disabled={!isServiceable || !deliveryAddress.trim()}
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
              <span className="text-brand-muted">{fullName} ({phone}) · {deliveryAddress}, {selectedArea === "Other" ? customArea : selectedArea}</span>
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

          {/* CARD 1: PAY NOW (Food Total) */}
          <div className="bg-brand-yellow/15 border-2 border-brand-yellow/50 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-brand-yellow/30 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
                  Payment 1 of 2 · Immediate Online Prepayment
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark uppercase tracking-tight mt-0.5">
                  Food Total (Pay Now)
                </h3>
              </div>
              <div className="font-display font-extrabold text-2xl sm:text-3xl text-brand-dark">
                {formatGHS(subtotalPesewas)}
              </div>
            </div>

            {/* Payment Method Badges */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-brand-dark uppercase tracking-wider">
                Instant Payment Methods Supported:
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-brand-dark">
                <span className="bg-white px-3 py-1.5 rounded-full border border-black/5 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-yellow-dark" />
                  <span>MTN Mobile Money</span>
                </span>
                <span className="bg-white px-3 py-1.5 rounded-full border border-black/5 shadow-xs flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-red" />
                  <span>Telecel Cash</span>
                </span>
                <span className="bg-white px-3 py-1.5 rounded-full border border-black/5 shadow-xs flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-brand-dark" />
                  <span>Debit / Credit Card</span>
                </span>
              </div>
              <p className="text-xs text-brand-muted pt-1">
                Processed with 256-bit bank encryption via Hubtel in Ghanaian Cedis (GHS).
              </p>
            </div>

            {/* --- PAYMENT METHOD SELECTION --- */}
            <div className="mt-8 mb-4">
              <h3 className="text-sm font-black tracking-wide text-[#18110E] mb-3 uppercase">
                Payment Method
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option A: Hubtel */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('hubtel')}
                  className={`relative p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    paymentMethod === 'hubtel' 
                      ? 'border-brand-yellow bg-brand-yellow/15 shadow-xs' 
                      : 'border-black/10 hover:border-black/20 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className={paymentMethod === 'hubtel' ? 'text-brand-yellow-dark' : 'text-black/40'} size={24} />
                    <span className="font-bold text-[#18110E]">Pay Online (Hubtel)</span>
                  </div>
                  <p className="text-xs text-black/60 pl-9 leading-relaxed">
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
                      ? 'border-brand-yellow bg-brand-yellow/15 shadow-xs' 
                      : 'border-black/10 hover:border-black/20 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Wallet className={paymentMethod === 'manual' ? 'text-brand-yellow-dark' : 'text-black/40'} size={24} />
                    <span className="font-bold text-[#18110E]">Manual MoMo / Cash</span>
                  </div>
                  <p className="text-xs text-black/60 pl-9 leading-relaxed">
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
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting || !isServiceable}
                onClick={handleProceedToPayment}
                className="w-full inline-flex items-center justify-center gap-3 py-4 sm:py-5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-50 text-brand-dark font-extrabold text-sm sm:text-base uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Processing...</span>
                ) : paymentMethod === "hubtel" ? (
                  <>
                    <span>Proceed to Secure Payment ➔</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Order &amp; View Instructions ➔</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* CARD 2: PAY RIDER (Delivery Fee) */}
          <div className="bg-black/5 border border-black/10 rounded-3xl p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between border-b border-black/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-dark shadow-xs flex-none">
                  <Bike className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">
                    Payment 2 of 2 · Upon Arrival
                  </span>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-brand-dark uppercase tracking-tight mt-0.5">
                    Delivery Fee (Pay Rider)
                  </h3>
                </div>
              </div>
              <div className="font-display font-extrabold text-2xl text-brand-dark">
                {formatGHS(deliveryFeePesewas)}
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-brand-muted leading-relaxed">
              <p>
                <strong className="text-brand-dark">Protocol:</strong> Hand this exact amount directly to your dispatch courier when your hot lunch arrives at your doorstep in {selectedArea === "Other" ? customArea : selectedArea}.
              </p>
              <p>
                Riders accept <strong className="text-brand-dark">Cash</strong> or direct <strong className="text-brand-dark">Mobile Money</strong> on arrival.
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
    </main>
  );
}
