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
import { ArrowRight, ArrowLeft, Bike, ShieldCheck, Lock, Clock, Check, CreditCard } from "lucide-react";

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
  const { items, subtotalPesewas, clearCart, isLoaded } = useCart();

  // Step tracking ("cart", "details", "delivery", "payment")
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("details");

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

  if (!isLoaded) {
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
      // 1. Submit order to /api/orders
      const orderPayload = {
        customerName: fullName.trim(),
        phone: phone.trim(),
        area: activeArea.trim(),
        deliveryAddress: deliveryAddress.trim(),
        landmark: landmark.trim() || undefined,
        deliverySlot,
        items: items.map((i) => ({
          mealId: i.mealId,
          size: i.size,
          includedProteinPackageName: i.includedProteinPackageName,
          extras: i.extras || {},
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const orderResult = await res.json();

      if (!res.ok) {
        setErrorMessage(orderResult.error || "Failed to create order");
        setIsSubmitting(false);
        return;
      }

      // 2. Initialize Paystack payment for food subtotal
      const payRes = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: orderResult.orderId,
        }),
      });

      const payResult = await payRes.json();

      if (!payRes.ok || !payResult.authorizationUrl) {
        setErrorMessage(payResult.error || "Payment gateway initialization failed");
        setIsSubmitting(false);
        return;
      }

      // 3. Clear cart and redirect to Paystack authorization
      clearCart();
      window.location.href = payResult.authorizationUrl;
    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
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
              <input
                type="text"
                placeholder="e.g. 14 Boundary Road, East Legon"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                className="w-full bg-brand-cream/50 border border-brand-cream-dark focus:border-brand-yellow focus:bg-white rounded-xl p-3.5 text-sm text-brand-dark outline-none transition-all placeholder:text-brand-muted/50"
                required
              />
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
                Processed with 256-bit bank encryption via Paystack in Ghanaian Cedis (GHS).
              </p>
            </div>

            {/* Main Action CTA */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting || !isServiceable}
                onClick={handleProceedToPayment}
                className="w-full inline-flex items-center justify-center gap-3 py-4 sm:py-5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-50 text-brand-dark font-extrabold text-sm sm:text-base uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow cursor-pointer"
              >
                <span>
                  {isSubmitting
                    ? "Connecting to Paystack…"
                    : `Pay ${formatGHS(subtotalPesewas)} for Food`}
                </span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
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
            <span>256-bit bank encryption · Secure Paystack Ghana Checkout</span>
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
