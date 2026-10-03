"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Clock,
  Bike,
  ChefHat,
  PackageCheck,
  Phone,
  MessageSquare,
  Star,
  Sparkles,
  MapPin,
  Calendar,
  CreditCard,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Wallet,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatGHS } from "@/lib/pricing";
import { getMealMedia } from "@/lib/media/meals";

// Strictly typed tracking state
export type TrackingStatus =
  | "PENDING"
  | "PREPARING"
  | "OUT_FOR_DELIVERY"
  | "RIDER_ARRIVING"
  | "DELIVERED"
  | "EXPIRED";

export interface OrderItemCustomization {
  name: string;
  thumbnailUrl: string;
  price: number;
  customizations: string[];
}

export interface OrderDetails {
  id: string;
  status: TrackingStatus;
  customerName: string;
  customerPhone?: string;
  deliveryAddress: string;
  delivery_address?: string;
  deliveryArea: string;
  landmark?: string;
  deliverySlot: string;
  delivery_slot?: string;
  foodTotal: number;
  deliveryFee: number;
  rider?: { name: string; phone: string };
  createdAt: string;
  paystackReference: string;
  paymentMethod?: string;
  paymentStatus?: string;
  cancellationReason?: string;
  items: OrderItemCustomization[];
}

export default function OrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = (params?.orderId as string) || (params?.id as string) || "";

  // Query parameter flags
  const isMock = searchParams.get("mock") === "true";
  const hasRef = Boolean(searchParams.get("reference"));
  const isNewQuery = searchParams.get("new") === "true";

  // State
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Phase 1: Packing celebration overlay state
  const [showPackingCelebration, setShowPackingCelebration] = useState(false);
  const [celebrationStep, setCelebrationStep] = useState<
    "text" | "drop" | "pack" | "bag" | "exit" | "done"
  >("text");

  // Phase 4: Unboxing & Rating state
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Initial load & Polling: Fetch order from server-side route (with admin rights)
  useEffect(() => {
    let isMounted = true;

    async function fetchOrder(showSpinner = false) {
      if (showSpinner) setLoading(true);
      try {
        let orderData: any = null;

        // 1. Fetch from secure server endpoint that bypasses RLS
        if (orderId && orderId !== "mock") {
          try {
            const res = await fetch(`/api/orders/${orderId}`);
            if (res.ok) {
              const json = await res.json();
              if (json?.order) {
                orderData = json.order;
              }
            }
          } catch (e) {
            console.warn("Could not fetch from /api/orders:", e);
          }
        }

        // 2. Direct client fallback if API failed
        if (!orderData && orderId && orderId !== "mock") {
          try {
            const supabase = createClient();
            const { data } = await supabase
              .from("orders")
              .select(`
                id,
                order_status,
                payment_status,
                payment_method,
                paystack_reference,
                subtotal_pesewas,
                delivery_fee_pesewas,
                delivery_slot,
                created_at,
                customer:customers (name, phone),
                address:addresses (address, area),
                items:order_items (
                  id,
                  quantity,
                  base_price_pesewas,
                  included_protein_package_name,
                  meal:meals (name),
                  size:meal_sizes (size),
                  order_item_proteins (quantity, protein:protein_options (name))
                )
              `)
              .eq("id", orderId)
              .maybeSingle();
            if (data) orderData = data;
          } catch (e) {
            console.warn("Could not fetch from supabase client:", e);
          }
        }

        if (!isMounted) return;

        if (orderData) {
          // Map DB status to UI TrackingStatus
          let mappedStatus: TrackingStatus = "PENDING";
          if (orderData.order_status === "cancelled") {
            mappedStatus = "EXPIRED";
            setShowPackingCelebration(false);
          } else if (orderData.order_status === "preparing" || orderData.order_status === "cooking") {
            mappedStatus = "PREPARING";
          } else if (orderData.order_status === "rider_arriving" || orderData.order_status === "arriving_soon") {
            mappedStatus = "RIDER_ARRIVING";
          } else if (
            orderData.order_status === "ready_for_dispatch" ||
            orderData.order_status === "dispatched" ||
            orderData.order_status === "out_for_delivery"
          )
            mappedStatus = "OUT_FOR_DELIVERY";
          else if (orderData.order_status === "delivered" || orderData.order_status === "completed")
            mappedStatus = "DELIVERED";

          const itemsList: OrderItemCustomization[] = (orderData.items || []).map((it: any) => {
            const mealName = it.meal?.name || "Jollof Rice";
            const sizeLabel = it.size?.size
              ? it.size.size.charAt(0).toUpperCase() + it.size.size.slice(1)
              : "Medium";
            const included = it.included_protein_package_name || "Chicken + Egg";
            const extrasList: string[] = (it.order_item_proteins || []).map(
              (p: any) => `Extra ${p.protein?.name || "Protein"} (x${p.quantity})`
            );

            const media = getMealMedia(mealName);
            return {
              name: mealName,
              thumbnailUrl: media.isolatedImage || media.image,
              price: it.base_price_pesewas * (it.quantity || 1),
              customizations: [sizeLabel, included, ...extrasList],
            };
          });

          const addressStr =
            (orderData.address as any)?.address ||
            (orderData as any)?.delivery_address ||
            "East Legon, Accra";
          const landmarkStr =
            (orderData.address as any)?.notes ||
            (orderData as any)?.landmark ||
            "";

          const resolvedOrder: OrderDetails = {
            id: orderData.id,
            status: mappedStatus,
            customerName: (orderData.customer as any)?.name || "Valued Customer",
            customerPhone: (orderData.customer as any)?.phone || "",
            deliveryAddress: addressStr,
            delivery_address: addressStr,
            deliveryArea: (orderData.address as any)?.area || "East Legon",
            landmark: landmarkStr,
            deliverySlot: orderData.delivery_slot || "11:30 AM",
            delivery_slot: orderData.delivery_slot || "11:30 AM",
            foodTotal: orderData.subtotal_pesewas || 7000,
            deliveryFee: orderData.delivery_fee_pesewas || 1000,
            createdAt: new Date(orderData.created_at || Date.now()).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            paystackReference: orderData.paystack_reference || `CAF-${orderData.id.slice(0, 8).toUpperCase()}`,
            paymentMethod: (orderData as any)?.payment_method || (searchParams.get("payment") === "manual" ? "manual" : "hubtel"),
            paymentStatus: orderData.payment_status || "unpaid",
            cancellationReason:
              orderData.cancellation_reason ||
              orderData.cancellationReason ||
              "Payment window expired after 15 minutes",
            rider:
              orderData.rider
                ? { name: orderData.rider.full_name, phone: orderData.rider.phone_number }
                : (mappedStatus === "OUT_FOR_DELIVERY" || mappedStatus === "RIDER_ARRIVING" || mappedStatus === "DELIVERED")
                ? { name: "Kwame Mensah", phone: "+233 24 555 0192" }
                : undefined,
            items: itemsList.length > 0 ? itemsList : [
              {
                name: "Jollof Rice",
                thumbnailUrl: "/images/meals/jollof-isolated.png",
                price: 7000,
                customizations: ["Medium", "Chicken + Egg"],
              },
            ],
          };

          setOrder(resolvedOrder);
        } else if (!order) {
          // Fallback / Mock Order for testing or direct navigation
          const fallbackOrder: OrderDetails = {
            id: orderId || `mock-${Date.now()}`,
            status: "PENDING",
            customerName: "Kwame Mensah",
            customerPhone: "+233 24 123 4567",
            deliveryAddress: "14 Boundary Road, East Legon",
            delivery_address: "14 Boundary Road, East Legon",
            deliveryArea: "East Legon",
            landmark: "Near Galaxy Int School",
            deliverySlot: "11:30 AM",
            delivery_slot: "11:30 AM",
            foodTotal: 7000,
            deliveryFee: 1000,
            createdAt: new Date().toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            paystackReference: `CAF-${(orderId || "MOCK").slice(0, 8).toUpperCase()}`,
            paymentMethod: searchParams.get("payment") === "manual" ? "manual" : "manual",
            paymentStatus: "unpaid",
            rider: undefined,
            items: [
              {
                name: "Jollof Rice",
                thumbnailUrl: "/images/meals/jollof-isolated.png",
                price: 7000,
                customizations: ["Medium", "Chicken + Egg", "Extra Sausage (x1)"],
              },
            ],
          };
          setOrder(fallbackOrder);
        }
      } catch (err: any) {
        console.warn("Could not fetch order:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchOrder(true);

    // Poll every 3 seconds for status changes (e.g. KDS dispatch, rider delivery)
    const interval = setInterval(() => {
      fetchOrder(false);
    }, 3000);

    // Check if celebration should trigger (new order placed, reference param, or mock)
    const hasSeenCelebration =
      typeof window !== "undefined" &&
      sessionStorage.getItem(`chef_celebration_seen_${orderId}`);

    if ((hasRef || isNewQuery || isMock || !hasSeenCelebration) && !hasSeenCelebration) {
      setShowPackingCelebration(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(`chef_celebration_seen_${orderId}`, "true");
      }
    }

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [orderId, hasRef, isNewQuery, isMock]);

  // Real-time Supabase Subscription for status updates
  useEffect(() => {
    if (!orderId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`order-tracking-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.order_status) {
            const dbStatus = payload.new.order_status;
            let mappedStatus: TrackingStatus = "PENDING";
            if (dbStatus === "cancelled") {
              mappedStatus = "EXPIRED";
              setShowPackingCelebration(false);
            } else if (dbStatus === "preparing" || dbStatus === "cooking") {
              mappedStatus = "PREPARING";
            } else if (dbStatus === "rider_arriving" || dbStatus === "arriving_soon") {
              mappedStatus = "RIDER_ARRIVING";
            } else if (
              dbStatus === "ready_for_dispatch" ||
              dbStatus === "dispatched" ||
              dbStatus === "out_for_delivery"
            ) {
              mappedStatus = "OUT_FOR_DELIVERY";
            } else if (dbStatus === "delivered" || dbStatus === "completed") {
              mappedStatus = "DELIVERED";
            }

            setOrder((prev) =>
              prev
                ? {
                    ...prev,
                    status: mappedStatus,
                    rider:
                      mappedStatus === "OUT_FOR_DELIVERY" ||
                      mappedStatus === "RIDER_ARRIVING" ||
                      mappedStatus === "DELIVERED"
                        ? prev.rider || { name: "Kwame Mensah", phone: "+233 24 555 0192" }
                        : undefined,
                  }
                : null
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  // Active live status directly from order
  const currentStatus: TrackingStatus = order?.status || "PENDING";

  // Re-sync rider when status changes
  const activeRider = useMemo(() => {
    if (order?.rider) return order.rider;
    if (
      currentStatus === "OUT_FOR_DELIVERY" ||
      currentStatus === "RIDER_ARRIVING" ||
      currentStatus === "DELIVERED"
    ) {
      return { name: "Kwame Mensah", phone: "+233 24 555 0192" };
    }
    return undefined;
  }, [order?.rider, currentStatus]);

  // Phase 1 Celebration choreography sequence
  useEffect(() => {
    if (!showPackingCelebration) return;

    // Sequence stages
    const timer1 = setTimeout(() => setCelebrationStep("drop"), 700);
    const timer2 = setTimeout(() => setCelebrationStep("pack"), 1600);
    const timer3 = setTimeout(() => setCelebrationStep("bag"), 2600);
    const timer4 = setTimeout(() => setCelebrationStep("exit"), 3700);
    const timer5 = setTimeout(() => {
      setCelebrationStep("done");
      setShowPackingCelebration(false);
    }, 4600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
    };
  }, [showPackingCelebration]);

  const primaryFoodImage =
    order?.items[0]?.thumbnailUrl || "/images/meals/jollof-isolated.png";
  const primaryMealName = order?.items[0]?.name || "Jollof Rice";

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream text-brand-dark flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-brand-yellow border-t-brand-red animate-spin mb-4" />
        <p className="font-display font-extrabold text-sm uppercase tracking-wider text-brand-dark">
          Locating your lunch order…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-cream text-brand-dark relative selection:bg-brand-yellow selection:text-brand-dark">
      {/* ========================================================================= */}
      {/* PHASE 1: THE "PACKING CELEBRATION" INTERSTITIAL (FULL-SCREEN ON LOAD)     */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showPackingCelebration && (
          <motion.div
            key="celebration-overlay"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
            className="fixed inset-0 z-[100] bg-brand-red flex flex-col items-center justify-center px-4 overflow-hidden select-none"
          >
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#80130E] via-brand-red to-[#B01F18] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl pointer-events-none" />

            {/* Skip Button */}
            <button
              type="button"
              onClick={() => {
                setShowPackingCelebration(false);
                setCelebrationStep("done");
              }}
              className="absolute top-6 right-6 z-50 text-xs font-black uppercase tracking-widest text-white/70 hover:text-white bg-black/20 hover:bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm transition-all"
            >
              Skip Celebration ✕
            </button>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-lg mx-auto text-center flex flex-col items-center justify-center min-h-[500px]">
              {/* Text Reveal */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-2 mb-8"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-brand-yellow text-[10px] font-black uppercase tracking-[0.2em] mb-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Order Confirmed</span>
                </div>
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight text-white leading-tight">
                  Your Meal is Being Packed!
                </h1>
                <p className="text-xs sm:text-sm text-white/80 max-w-xs mx-auto font-medium">
                  Chef Apedo kitchen is carefully assembling your fresh lunch
                </p>
              </motion.div>

              {/* Physical Animation Staging Area */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* 1. Food Drop */}
                <AnimatePresence>
                  {celebrationStep !== "exit" && (
                    <motion.div
                      key="dropping-food"
                      initial={{ y: -450, opacity: 0, scale: 0.9, rotate: -6 }}
                      animate={
                        celebrationStep === "text"
                          ? { y: -450, opacity: 0 }
                          : celebrationStep === "bag"
                            ? { y: 25, scale: 0.75, opacity: 0.9 }
                            : { y: 0, opacity: 1, scale: 1, rotate: 0 }
                      }
                      transition={{
                        type: "spring",
                        stiffness: 160,
                        damping: 14,
                      }}
                      className="absolute z-20 w-56 h-56 sm:w-64 sm:h-64"
                    >
                      <Image
                        src={primaryFoodImage}
                        alt="Packing Food"
                        fill
                        priority
                        className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 2. Paper Bowl Packaging With Transparent Dome Lid */}
                <AnimatePresence>
                  {(celebrationStep === "pack" || celebrationStep === "bag") && (
                    <motion.div
                      key="packaging-bowl"
                      initial={{ scale: 0.7, opacity: 0, y: 30 }}
                      animate={
                        celebrationStep === "bag"
                          ? { scale: 0.7, opacity: 0.6, y: 35 }
                          : { scale: 1, opacity: 1, y: 15 }
                      }
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="absolute z-30 w-64 h-64 sm:w-72 sm:h-72 pointer-events-none"
                    >
                      <Image
                        src="/images/packaging/takeout-paper-bowl.png"
                        alt="Takeout Bowl Packaging"
                        fill
                        priority
                        className="object-contain drop-shadow-2xl"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* 3. Kraft Paper Takeout Bag engulfing & sweeping off-screen */}
                <AnimatePresence>
                  {(celebrationStep === "bag" || celebrationStep === "exit") && (
                    <motion.div
                      key="kraft-bag"
                      initial={{ y: 400, opacity: 0, scale: 0.85 }}
                      animate={
                        celebrationStep === "exit"
                          ? {
                              x: 700,
                              rotate: 15,
                              opacity: 0,
                              transition: { duration: 0.6, ease: "easeIn" },
                            }
                          : {
                              y: 0,
                              opacity: 1,
                              scale: [0.85, 1.05, 1],
                              transition: { duration: 0.6, ease: "easeOut" },
                            }
                      }
                      className="absolute z-40 w-72 h-72 sm:w-84 sm:h-84 pointer-events-none"
                    >
                      <Image
                        src="/images/packaging/kraft-takeout-bag.png"
                        alt="Kraft Takeout Bag"
                        fill
                        priority
                        className="object-contain drop-shadow-[0_30px_35px_rgba(0,0,0,0.6)]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Progress dots at bottom */}
              <div className="flex items-center gap-2 mt-8">
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    celebrationStep === "drop" ? "bg-brand-yellow" : "bg-white/30"
                  }`}
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    celebrationStep === "pack" ? "bg-brand-yellow" : "bg-white/30"
                  }`}
                />
                <span
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    celebrationStep === "bag" || celebrationStep === "exit"
                      ? "bg-brand-yellow"
                      : "bg-white/30"
                  }`}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* PHASE 2: CORE ORDER TRACKING ARCHITECTURE                                  */}
      {/* ========================================================================= */}
      <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Navigation & Live Subscription Pill */}
        <div className="flex items-center justify-between">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-muted hover:text-brand-dark transition-colors uppercase tracking-wider"
          >
            <span>← Back to Menu</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-brand-cream-dark text-[11px] font-semibold text-brand-dark shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Live Status Active</span>
          </div>
        </div>

        {/* 1. Celebratory Hero or Expired Payment State */}
        {currentStatus === "EXPIRED" ? (
          <section className="text-center space-y-4 relative overflow-hidden bg-white border-2 border-brand-red/30 rounded-3xl p-6 sm:p-10 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center mx-auto shadow-xs">
              <Clock className="w-8 h-8 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-brand-red/10 text-brand-red text-[11px] font-black uppercase tracking-[0.2em]">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Payment Window Expired</span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-brand-dark leading-tight">
                Payment Not Completed
              </h1>

              <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
                {order?.cancellationReason ||
                  "This order was not confirmed within the 15-minute payment window to release kitchen capacity for other campus diners."}
              </p>

              <div className="pt-2 text-[11px] font-mono font-bold text-brand-muted">
                Order ID: <span className="text-brand-dark font-black">{order?.id}</span>
              </div>
            </div>

            {/* CTAs: Reorder / Chat on WhatsApp */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/menu"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-all shadow-button-yellow"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>Reorder Today&apos;s Meal</span>
              </Link>

              <a
                href={`https://wa.me/233240000000?text=${encodeURIComponent(
                  `Hi Chef Apedo, my payment for order ${order?.id || ""} timed out. Could you please assist me?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border-2 border-brand-cream-dark hover:border-brand-dark text-brand-dark font-extrabold text-xs uppercase tracking-wider transition-all bg-brand-cream/40"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </section>
        ) : (
          <section className="text-center space-y-3 relative overflow-hidden bg-white/70 border border-brand-cream-dark rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* Subtle Organic Background Blobs */}
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full bg-brand-yellow/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-brand-red/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-red/10 text-brand-red text-[10px] font-black uppercase tracking-[0.2em]">
                <Sparkles className="w-3 h-3" />
                <span>
                  {order?.paymentMethod === "manual"
                    ? "Order Received · Payment Pending"
                    : "Payment Verified · Online"}
                </span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-4xl uppercase tracking-tight text-brand-dark leading-tight">
                {order?.paymentMethod === "manual"
                  ? `Order Received, ${order?.customerName}!`
                  : `Woohoo! Your order is confirmed, ${order?.customerName}.`}
              </h1>

              <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto leading-relaxed">
                {order?.paymentMethod === "manual"
                  ? "Your order is logged and awaiting payment via Mobile Money or Cash on Delivery."
                  : "We've received your order and the kitchen is heating up."}
              </p>

              <div className="pt-2 text-[11px] font-mono font-bold text-brand-muted">
                Reference: <span className="text-brand-dark font-black">{order?.paystackReference}</span>
              </div>
            </div>
          </section>
        )}

        {/* ===================================================================== */}
        {/* HIGH-VISIBILITY MANUAL PAYMENT INSTRUCTION BLOCK                      */}
        {/* ===================================================================== */}
        {order?.paymentMethod === "manual" && currentStatus === "PENDING" && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-brand-yellow/15 border-2 border-brand-yellow rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-brand-yellow flex items-center justify-center text-brand-dark flex-none shadow-xs">
                <Wallet className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
                  Action Required · Manual MoMo / Cash
                </span>
                <h2 className="font-display font-black text-xl sm:text-2xl text-brand-dark uppercase tracking-tight">
                  How to Complete Your Payment
                </h2>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Your order has been logged in our kitchen. Please choose one of the two payment options below:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Option A: MoMo Transfer */}
              <div className="bg-white p-5 rounded-2xl border border-brand-yellow/50 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-brand-dark">
                      Option 1: MoMo Transfer
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-brand-yellow/20 text-brand-dark">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                    Transfer the food amount of <strong className="text-brand-dark font-bold">{formatGHS(order.foodTotal)}</strong> to our official merchant MoMo line:
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-brand-cream border border-brand-cream-dark flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-muted block">Merchant Line (MTN / Telecel)</span>
                      <span className="font-mono text-base font-black text-brand-dark">055 000 0000</span>
                    </div>
                    <span className="text-[11px] font-display font-extrabold text-brand-red uppercase">Chef Apedo Foods</span>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-brand-muted border-t border-brand-cream-dark">
                  Use Order Reference: <strong className="font-mono text-brand-dark font-bold">{order.paystackReference}</strong>
                </div>
              </div>

              {/* Option B: Cash on Delivery */}
              <div className="bg-white p-5 rounded-2xl border border-black/10 shadow-xs space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-brand-dark">
                      Option 2: Cash Upon Delivery
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-black/5 text-brand-dark">
                      Pay Rider
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-1.5 leading-relaxed">
                    Pay the dispatch courier directly upon arrival at your doorstep:
                  </p>
                  <div className="mt-3 p-3 rounded-xl bg-brand-cream border border-brand-cream-dark text-xs space-y-1.5">
                    <div className="flex justify-between text-brand-muted">
                      <span>Food Total:</span>
                      <span className="font-bold text-brand-dark">{formatGHS(order.foodTotal)}</span>
                    </div>
                    <div className="flex justify-between text-brand-muted">
                      <span>Delivery Fee:</span>
                      <span className="font-bold text-brand-dark">{formatGHS(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-brand-cream-dark font-extrabold text-sm text-brand-dark">
                      <span>Total Due on Arrival:</span>
                      <span className="text-brand-red font-display font-black">{formatGHS(order.foodTotal + order.deliveryFee)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-brand-muted border-t border-brand-cream-dark">
                  Riders accept exact cash or direct Mobile Money on arrival.
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===================================================================== */}
        {/* CONDITIONAL SWITCH: IF DELIVERED -> PHASE 4 (UNBOXING & RATING)       */}
        {/* ELSE -> PHASE 2 & 3 (TIMELINE, PAY RIDER CARD, STRUCTURED RECEIPT)    */}
        {/* ===================================================================== */}
        <AnimatePresence mode="wait">
          {currentStatus === "DELIVERED" ? (
            /* =================================================================== */
            /* PHASE 4: THE "UNBOXING" POST-DELIVERY FLOW (STATE CHANGE)           */
            /* =================================================================== */
            <motion.section
              key="delivered-unboxing-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              {/* Unboxing Stage */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-cream-dark shadow-sm text-center relative overflow-hidden space-y-6">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-green-500/10 text-green-700 text-xs font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Delivered to Your Doorstep</span>
                </div>

                <div className="relative w-64 h-64 sm:w-72 sm:h-72 mx-auto flex items-center justify-center">
                  {/* Dynamic rising food bowl */}
                  <motion.div
                    initial={{ y: 80, scale: 0.75, opacity: 0 }}
                    animate={{ y: 0, scale: 1, opacity: 1 }}
                    transition={{
                      delay: 0.2,
                      type: "spring",
                      stiffness: 140,
                      damping: 14,
                    }}
                    className="relative w-56 h-56 sm:w-64 sm:h-64 z-20"
                  >
                    <Image
                      src={primaryFoodImage}
                      alt={primaryMealName}
                      fill
                      priority
                      className="object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)]"
                    />
                  </motion.div>

                  {/* Fading Kraft Bag underneath */}
                  <motion.div
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute inset-0 z-10"
                  >
                    <Image
                      src="/images/packaging/kraft-takeout-bag.png"
                      alt="Unboxing Bag"
                      fill
                      className="object-contain"
                    />
                  </motion.div>
                </div>

                {/* Rating Card */}
                <div className="max-w-md mx-auto space-y-4 pt-2">
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-brand-dark uppercase">
                    Your meal has arrived! How was your {primaryMealName}?
                  </h3>

                  {reviewSubmitted ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-5 rounded-2xl bg-brand-yellow/20 border border-brand-yellow/40 text-brand-dark space-y-2"
                    >
                      <Sparkles className="w-6 h-6 text-brand-red mx-auto" />
                      <h4 className="font-display font-extrabold text-lg uppercase">
                        Thank You for Dining with Us!
                      </h4>
                      <p className="text-xs text-brand-dark/80">
                        Your review directly supports Chef Apedo&apos;s kitchen craft. Have a wonderful lunch!
                      </p>
                    </motion.div>
                  ) : (
                    <div className="space-y-5">
                      {/* Interactive 5-Star Tappable Rating */}
                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((starIndex) => {
                          const isActive = (hoverRating || rating) >= starIndex;
                          return (
                            <button
                              key={starIndex}
                              type="button"
                              onClick={() => setRating(starIndex)}
                              onMouseEnter={() => setHoverRating(starIndex)}
                              onMouseLeave={() => setHoverRating(0)}
                              className="p-1 transition-transform hover:scale-125 active:scale-95 focus:outline-none"
                              aria-label={`Rate ${starIndex} stars`}
                            >
                              <Star
                                className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                                  isActive
                                    ? "text-brand-yellow fill-brand-yellow stroke-brand-yellow-dark"
                                    : "text-black/20 fill-transparent stroke-black/30"
                                }`}
                              />
                            </button>
                          );
                        })}
                      </div>

                      {/* Quick Feedback Tags */}
                      <div className="flex flex-wrap justify-center gap-2">
                        {[
                          "Hot & Fresh",
                          "Smoky Flavor",
                          "Fast Delivery",
                          "Generous Portion",
                          "Great Packaging",
                        ].map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => {
                                setSelectedTags((prev) =>
                                  prev.includes(tag)
                                    ? prev.filter((t) => t !== tag)
                                    : [...prev, tag]
                                );
                              }}
                              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                                isSelected
                                  ? "bg-brand-dark text-white border-brand-dark shadow-xs"
                                  : "bg-white text-brand-muted border-black/10 hover:border-black/25"
                              }`}
                            >
                              {tag}
                            </button>
                          );
                        })}
                      </div>

                      {/* Submit Button */}
                      <div>
                        <button
                          type="button"
                          disabled={rating === 0 || isSubmittingReview}
                          onClick={async () => {
                            if (rating === 0) return;
                            setIsSubmittingReview(true);
                            try {
                              const commentText = selectedTags.length > 0 ? `Tags: ${selectedTags.join(", ")}` : null;
                              await fetch("/api/feedback", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  order_id: order?.id || orderId,
                                  rating,
                                  customer_comment: commentText,
                                }),
                              });
                              setReviewSubmitted(true);
                            } catch (err) {
                              console.error("Failed to submit review:", err);
                              setReviewSubmitted(true);
                            } finally {
                              setIsSubmittingReview(false);
                            }
                          }}
                          className="w-full py-4 rounded-full bg-brand-yellow hover:bg-brand-yellow-dark disabled:opacity-40 text-brand-dark font-extrabold text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 transform hover:-translate-y-0.5 shadow-button-yellow cursor-pointer"
                        >
                          {isSubmittingReview ? "Submitting Review..." : "Submit Experience Review"}
                        </button>

                        <div className="text-center pt-2">
                          <Link
                            href={`/feedback/${order?.id || orderId}`}
                            className="text-[11px] font-bold text-brand-muted hover:text-brand-dark underline transition-colors"
                          >
                            Or write detailed comments for the kitchen &rarr;
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.section>
          ) : currentStatus === "EXPIRED" ? null : (
            /* =================================================================== */
            /* PHASE 2 & 3: ACTIVE TRACKING TIMELINE & PAY RIDER CARD              */
            /* =================================================================== */
            <motion.div
              key="active-tracking-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {/* 2. The Live Tracking Timeline */}
              <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-cream-dark shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-brand-cream-dark pb-3">
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
                    Order Status Progression
                  </span>
                  {order?.deliverySlot &&
                    !order.deliverySlot.toLowerCase().includes("asap") &&
                    !order.deliverySlot.toLowerCase().includes("instant") && (
                      <p className="text-xs font-bold text-brand-muted">
                        Slot: {order.deliverySlot}
                      </p>
                    )}
                </div>

                {/* Proximity Alert Banner (~3 mins out) */}
                {currentStatus === "RIDER_ARRIVING" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-5 rounded-2xl bg-amber-500 text-brand-dark border-2 border-amber-600 shadow-md space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-red"></span>
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-brand-dark">
                          ⚡ Courier is Arriving! (~3 Mins Out)
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-brand-dark text-brand-yellow font-display">
                        Meet Rider
                      </span>
                    </div>

                    <p className="text-xs font-bold text-brand-dark/95 leading-relaxed">
                      Please be ready at {order?.delivery_address || order?.deliveryAddress || "your delivery address"} {order?.landmark ? `(${order.landmark})` : ''}!
                    </p>

                    {activeRider?.phone && (
                      <div className="pt-1 flex items-center gap-2">
                        <a
                          href={`tel:${activeRider.phone}`}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-dark hover:bg-black text-brand-yellow text-xs font-black uppercase tracking-wider transition-all shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Rider: {activeRider.phone}</span>
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Timeline: Vertical on mobile (flex-col), Horizontal on desktop (md:flex-row) */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-2 relative pt-2">
                  {[
                    {
                      id: "PENDING",
                      label: "Order Received",
                      icon: CheckCircle2,
                    },
                    {
                      id: "PREPARING",
                      label: "Preparing",
                      icon: ChefHat,
                    },
                    {
                      id: "OUT_FOR_DELIVERY",
                      label: "Dispatched",
                      icon: Bike,
                    },
                    {
                      id: "RIDER_ARRIVING",
                      label: "Arriving Soon",
                      icon: Clock,
                    },
                    {
                      id: "DELIVERED",
                      label: "Delivered",
                      icon: PackageCheck,
                    },
                  ].map((step, idx) => {
                    const statusOrder: TrackingStatus[] = [
                      "PENDING",
                      "PREPARING",
                      "OUT_FOR_DELIVERY",
                      "RIDER_ARRIVING",
                      "DELIVERED",
                    ];
                    const currentIndex = statusOrder.indexOf(currentStatus);
                    const stepIndex = statusOrder.indexOf(step.id as TrackingStatus);

                    const isCompleted = stepIndex < currentIndex;
                    const isCurrent = stepIndex === currentIndex;
                    const isUpcoming = stepIndex > currentIndex;

                    const IconComponent = step.icon;

                    return (
                      <div
                        key={step.id}
                        className="flex items-center gap-3 md:flex-col md:items-center md:text-center relative z-10 flex-1"
                      >
                        {/* Connecting Line: vertical on mobile (w-0.5 h-full), horizontal on desktop (h-0.5 w-full) */}
                        {idx < 4 && (
                          <>
                            {/* Mobile vertical connector */}
                            <div
                              className={`absolute left-5 top-10 w-0.5 h-full md:hidden -z-10 transition-colors ${
                                stepIndex < currentIndex
                                  ? "bg-brand-red"
                                  : "border-l-2 border-dashed border-black/15"
                              }`}
                            />
                            {/* Desktop horizontal connector */}
                            <div
                              className={`absolute hidden md:block top-5 left-1/2 w-full h-0.5 -z-10 transition-colors ${
                                stepIndex < currentIndex
                                  ? "bg-brand-red"
                                  : "border-t-2 border-dashed border-black/15"
                              }`}
                            />
                          </>
                        )}

                        {/* Node Circle */}
                        <div
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all flex-none ${
                            isCompleted
                              ? "bg-brand-red text-white shadow-xs"
                              : isCurrent
                                ? "bg-brand-yellow text-brand-dark ring-4 ring-brand-yellow/40 shadow-sm"
                                : "bg-brand-cream border border-brand-cream-dark text-brand-muted"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5 stroke-[3]" />
                          ) : isCurrent && step.id === "OUT_FOR_DELIVERY" ? (
                            <motion.div
                              animate={{ x: [-3, 3, -3] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                            >
                              <Bike className="w-5 h-5 stroke-[2.5]" />
                            </motion.div>
                          ) : (
                            <IconComponent
                              className={`w-5 h-5 stroke-[2.5] ${
                                isCurrent ? "animate-pulse" : ""
                              }`}
                            />
                          )}
                        </div>

                        {/* Node Label */}
                        <span
                          className={`font-display text-xs md:text-[11px] uppercase tracking-tight font-extrabold md:mt-2 ${
                            isCurrent
                              ? "text-brand-dark"
                              : isCompleted
                                ? "text-brand-dark/80"
                                : "text-brand-muted"
                          }`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>


                {/* Status Descriptive Pill */}
                <div className="bg-brand-cream p-3.5 rounded-2xl flex items-center gap-3 text-xs text-brand-muted">
                  <Clock className="w-4 h-4 text-brand-yellow-dark flex-none" />
                  <span>
                    {currentStatus === "PENDING" &&
                      "Order confirmed and queued for preparation. The kitchen begins cooking for your 11:30 slot."}
                    {currentStatus === "PREPARING" &&
                      "Your meal is currently on the fire and being seasoned with fresh aromatics."}
                    {currentStatus === "OUT_FOR_DELIVERY" &&
                      "Your dispatch courier has picked up the hot package and is heading to your location."}
                  </span>
                </div>
              </section>

              {/* 3. The Critical "Pay Rider" Action Card (Matches Checkout Muted Card 2) */}
              <section className="bg-black/5 border border-black/10 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 border-b border-black/10 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-brand-dark shadow-xs flex-none">
                      <Bike className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">
                        Payment 2 of 2 · Due on Arrival
                      </span>
                      <h3 className="font-display font-extrabold text-lg sm:text-xl md:text-2xl text-brand-dark uppercase tracking-tight mt-0.5 leading-tight break-words">
                        DELIVERY FEE (PAY RIDER)
                      </h3>
                    </div>
                  </div>
                  <div className="font-display font-extrabold text-2xl text-brand-dark flex-none sm:ml-auto">
                    {formatGHS(order?.deliveryFee || 1000)}
                  </div>
                </div>

                {/* Instruction */}
                <p className="text-xs sm:text-sm text-brand-muted leading-relaxed font-medium">
                  Please have <strong className="text-brand-dark">{formatGHS(order?.deliveryFee || 1000)}</strong> ready in cash or Mobile Money for your rider upon arrival in {order?.deliveryArea}.
                </p>

                {/* Rider Details Section */}
                {activeRider ? (
                  <div className="pt-3 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-yellow text-brand-dark flex items-center justify-center font-black text-xs shadow-xs">
                        {activeRider.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-black text-brand-dark">
                          {activeRider.name} is assigned
                        </div>
                        <div className="text-[11px] text-brand-muted">
                          Official Chef Apedo Dispatch Courier
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${activeRider.phone}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/10 hover:border-black/30 text-brand-dark text-xs font-bold shadow-2xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 text-brand-red" />
                        <span>Call Rider</span>
                      </a>
                      <a
                        href={`https://wa.me/${activeRider.phone.replace(/[^0-9]/g, "")}?text=Hi%20${encodeURIComponent(activeRider.name)},%20inquiring%20about%20my%20order%20${order?.paystackReference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-black/10 hover:border-black/30 text-brand-dark text-xs font-bold shadow-2xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-green-600" />
                        <span>Chat</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="pt-2 text-xs text-brand-muted flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-yellow-dark" />
                    <span>Courier will be assigned once packaging is complete in the kitchen.</span>
                  </div>
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================================= */}
        {/* PHASE 3: THE STRUCTURED ORDER RECEIPT                                     */}
        {/* ========================================================================= */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-brand-cream-dark shadow-sm space-y-6">
          <div className="border-b border-brand-cream-dark pb-3 flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-brand-red">
              Order Receipt
            </span>
            <span className="text-xs font-bold text-brand-muted font-mono">
              #{order?.paystackReference}
            </span>
          </div>

          {/* Metadata Header Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-brand-cream text-xs">
            <div className="space-y-1">
              <span className="font-bold text-brand-dark flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-red" />
                <span>Delivery Address</span>
              </span>
              <p className="text-brand-muted leading-tight">
                {order?.deliveryAddress}, {order?.deliveryArea}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-brand-dark flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-yellow-dark" />
                <span>Slot &amp; Date</span>
              </span>
              <p className="text-brand-muted leading-tight">
                {order?.deliverySlot} · {order?.createdAt}
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-brand-dark flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-green-600" />
                <span>Payment Method</span>
              </span>
              <p className="text-brand-muted leading-tight">
                {order?.paymentMethod === 'manual' ? 'Manual MoMo Direct' : 'Mobile Money / Card (Hubtel)'}
              </p>
            </div>
          </div>

          {/* Item Breakdown (Map over order.items) */}
          <div className="divide-y divide-brand-cream-dark">
            {(order?.items || []).map((item, idx) => (
              <div key={idx} className="py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Small Isolated Food Thumbnail */}
                  <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-brand-cream-dark flex-none border border-black/5 p-1">
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-contain"
                    />
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-display font-extrabold text-sm sm:text-base text-brand-dark uppercase">
                      {item.name}
                    </h4>

                    {/* Muted Bulleted Customizations */}
                    <ul className="text-xs text-brand-muted space-y-0.5 font-medium">
                      {item.customizations.map((c, cIdx) => (
                        <li key={cIdx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-red flex-none" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="font-display font-extrabold text-base text-brand-dark flex-none">
                  {formatGHS(item.price)}
                </div>
              </div>
            ))}
          </div>

          {/* Financial Totals (Strict Separation per Rule 2) */}
          <div className="pt-4 border-t border-brand-cream-dark space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center">
              <span className="text-brand-dark font-medium">Subtotal (Food)</span>
              <span className="font-bold text-brand-dark">
                {formatGHS(order?.foodTotal || 7000)}{" "}
                <span className="text-green-600 font-extrabold ml-1">(Paid)</span>
              </span>
            </div>

            <div className="flex justify-between items-center text-brand-muted">
              <span className="flex items-center gap-1.5">
                <Bike className="w-3.5 h-3.5 text-brand-yellow-dark" />
                <span>Delivery Fee</span>
              </span>
              <span className="font-extrabold text-brand-red">
                {formatGHS(order?.deliveryFee || 1000)} (Due on Delivery)
              </span>
            </div>

            <div className="pt-2 border-t border-brand-cream-dark flex justify-between items-center font-bold text-sm">
              <span className="text-brand-dark font-extrabold uppercase tracking-tight">
                Total Paid Today
              </span>
              <span className="font-display font-extrabold text-xl text-brand-dark">
                {formatGHS(order?.foodTotal || 7000)}
              </span>
            </div>
          </div>
        </section>

        {/* WhatsApp Support & Action Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="text-xs text-brand-muted">
            Questions about your order? We respond instantly on WhatsApp.
          </div>
          <a
            href={`https://wa.me/233240000000?text=Hi%20Chef%20Apedo,%20inquiring%20about%20order%20${order?.paystackReference}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-dark hover:bg-[#141414] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 text-brand-yellow" />
            <span>Chat with Kitchen</span>
          </a>
        </div>
      </div>
    </div>
  );
}
