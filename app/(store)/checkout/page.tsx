"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/lib/cart/store";
import { CheckoutStepper, type CheckoutStep } from "@/components/ui/CheckoutStepper";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { WarningBox } from "@/components/ui/WarningBox";
import { Banner } from "@/components/ui/Banner";
import { OptionRow } from "@/components/ui/OptionRow";
import { SplitPaymentCard } from "@/components/ui/SplitPaymentCard";
import { StickyCTA } from "@/components/ui/StickyCTA";
import { isAreaServiceable } from "@/lib/delivery";
import { formatGHS } from "@/lib/pricing";
import { EXCLUDED_DELIVERY_AREAS } from "@/config/business";
import { createClient } from "@/lib/supabase/client";

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
    let fee = 1000; // default base starting fee
    for (const z of zones) {
      if (z.areas.some((a) => a.toLowerCase() === norm)) {
        fee = z.feePesewas;
        break;
      }
    }
    setDeliveryFeePesewas(fee);
  }, [selectedArea, customArea, zones]);

  if (!isLoaded) {
    return <main className="py-12 text-center text-ink-dim">Loading checkout…</main>;
  }

  if (items.length === 0) {
    return (
      <main className="space-y-4 pt-6 text-center">
        <Card className="py-8">
          <p className="text-ink-dim text-[13px] mb-3">Your cart is empty.</p>
          <Link href="/menu">
            <Button variant="primary">Return to Menu</Button>
          </Link>
        </Card>
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

      // 3. Clear cart and redirect to Paystack authorization or confirmation view
      clearCart();
      window.location.href = payResult.authorizationUrl;
    } catch (err: any) {
      console.error("Checkout submission failed:", err);
      setErrorMessage("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="space-y-6 pb-24 max-w-2xl mx-auto">
      {/* Checkout Stepper */}
      <CheckoutStepper currentStep={currentStep} />

      <div className="space-y-1">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink tracking-tight">
          {currentStep === "details" && "Your Details"}
          {currentStep === "delivery" && "Delivery Details"}
          {currentStep === "payment" && "Payment Review"}
        </h1>
        <p className="text-xs sm:text-sm text-ink-dim">
          {currentStep === "details" && "Guest checkout — no password or account needed."}
          {currentStep === "delivery" && "Where and when should we deliver your meal in Accra?"}
          {currentStep === "payment" && "Prepay food now; pay delivery fee to rider upon arrival."}
        </p>
      </div>

      {errorMessage && (
        <WarningBox className="my-2">{errorMessage}</WarningBox>
      )}

      {/* STEP 2: CUSTOMER DETAILS */}
      {currentStep === "details" && (
        <Card className="space-y-3">
          <FormField
            label="Full name"
            placeholder="e.g. Godwin Apedo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />

          <FormField
            label="Phone number"
            placeholder="e.g. 024 000 0000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            note="Ghana mobile number for delivery coordination"
            required
          />

          <StickyCTA>
            <Button
              variant="primary"
              className="w-full"
              disabled={!fullName.trim() || !phone.trim()}
              onClick={() => setCurrentStep("delivery")}
            >
              Continue to Delivery
            </Button>
          </StickyCTA>
        </Card>
      )}

      {/* STEP 3: DELIVERY DETAILS & SLOT */}
      {currentStep === "delivery" && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-1">
              Select Delivery Area
            </div>

            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full bg-surface2 border border-line rounded-lg text-ink p-2.5 text-[13px] outline-none focus:border-gold"
            >
              <optgroup label="Available Delivery Areas">
                {zones.flatMap((z) =>
                  z.areas.map((area) => (
                    <option key={area} value={area}>
                      {area} (Fee: {formatGHS(z.feePesewas)})
                    </option>
                  ))
                )}
              </optgroup>
              <optgroup label="Excluded Areas (Unserviceable)">
                {EXCLUDED_DELIVERY_AREAS.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex} (Excluded)
                  </option>
                ))}
              </optgroup>
              <option value="Other">Other / Type manually</option>
            </select>

            {selectedArea === "Other" && (
              <FormField
                label="Type your area"
                placeholder="e.g. Airport Residential"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
              />
            )}

            {!isServiceable ? (
              <WarningBox>
                We currently don&apos;t deliver to this area. Please choose another location or contact us on WhatsApp.
              </WarningBox>
            ) : (
              <Banner>
                Delivery fee: <strong className="text-gold">{formatGHS(deliveryFeePesewas)}</strong> — paid directly to rider on arrival.
              </Banner>
            )}

            <FormField
              label="Street address & house number"
              placeholder="e.g. 14 Boundary Road, East Legon"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              required
            />

            <FormField
              label="Landmark / Directions"
              placeholder="e.g. Near Starbites, opposite yellow gate"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
            />
          </Card>

          {/* Delivery Slot Card */}
          <Card>
            <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
              Choose Delivery Time
            </div>
            <div className="divide-y divide-line">
              {DELIVERY_SLOTS.map((slot) => (
                <OptionRow
                  key={slot.id}
                  label={slot.label}
                  selected={deliverySlot === slot.label}
                  disabled={!slot.available}
                  rightElement={
                    <span className="text-[11px] text-ok border border-ok/30 px-2 py-0.5 rounded-full">
                      Available
                    </span>
                  }
                  onClick={() => setDeliverySlot(slot.label)}
                />
              ))}
            </div>
          </Card>

          <StickyCTA>
            <div className="flex gap-2 w-full">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setCurrentStep("details")}
              >
                Back
              </Button>
              <Button
                variant="primary"
                className="flex-[2]"
                disabled={!isServiceable || !deliveryAddress.trim()}
                onClick={() => setCurrentStep("payment")}
              >
                Continue to Payment
              </Button>
            </div>
          </StickyCTA>
        </div>
      )}

      {/* STEP 4: PAYMENT REVIEW & PREPAYMENT */}
      {currentStep === "payment" && (
        <div className="space-y-4">
          <Card>
            <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
              Payment Method
            </div>
            <p className="text-[12px] text-ink-dim leading-relaxed mb-3">
              Your food is paid for in advance via Paystack to secure kitchen preparation.
            </p>
            <div className="bg-surface2/60 border border-line rounded-lg p-3 text-[13px] space-y-2">
              <div className="flex items-center gap-2 text-ink">
                <span className="w-2 h-2 rounded-full bg-gold" />
                <span>MTN Mobile Money / Telecel Cash / Card</span>
              </div>
              <p className="text-[11px] text-ink-dim">
                Securely processed in Ghanaian Cedis (GHS) via Paystack.
              </p>
            </div>
          </Card>

          {/* Split Payment Card — strictly separates Pay Now vs Pay Rider */}
          <Card>
            <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
              Order Total Breakdown
            </div>
            <div className="flex justify-between py-1 text-[13px]">
              <span className="text-ink">Food subtotal</span>
              <span className="text-ink font-medium">{formatGHS(subtotalPesewas)}</span>
            </div>
            <div className="flex justify-between py-1 text-[13px] border-b border-line pb-2 mb-2">
              <span className="text-ink">Delivery ({selectedArea === "Other" ? customArea : selectedArea})</span>
              <span className="text-ink font-medium">{formatGHS(deliveryFeePesewas)}</span>
            </div>

            <SplitPaymentCard
              payNowAmount={formatGHS(subtotalPesewas)}
              payRiderAmount={formatGHS(deliveryFeePesewas)}
              isRiderAmountPending={false}
            />
          </Card>

          <StickyCTA>
            <div className="flex gap-2 w-full">
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => setCurrentStep("delivery")}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button
                variant="primary"
                className="flex-[2] shadow-lg"
                disabled={isSubmitting || !isServiceable}
                onClick={handleProceedToPayment}
              >
                {isSubmitting ? "Connecting to Paystack…" : `Pay ${formatGHS(subtotalPesewas)}`}
              </Button>
            </div>
          </StickyCTA>
        </div>
      )}
    </main>
  );
}
