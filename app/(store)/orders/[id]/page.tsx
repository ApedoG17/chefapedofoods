import React from "react";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { OrderStatusSteps } from "@/components/ui/OrderStatusSteps";
import { WarningBox } from "@/components/ui/WarningBox";
import { Button } from "@/components/ui/Button";
import { formatGHS } from "@/lib/pricing";
import { Clock, Bike, MessageSquare, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function OrderStatusPage(props: PageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const orderId = resolvedParams.id;
  const adminSupabase = createAdminClient();

  const { data: order, error } = await adminSupabase
    .from("orders")
    .select(`
      id,
      order_status,
      payment_status,
      paystack_reference,
      subtotal_pesewas,
      delivery_fee_pesewas,
      delivery_slot,
      created_at,
      cancellation_reason,
      cancelled_at,
      customer:customers (
        name,
        phone
      ),
      address:addresses (
        address,
        area
      ),
      items:order_items (
        id,
        quantity,
        base_price_pesewas,
        included_protein_package_name,
        meal:meals (
          name
        ),
        size:meal_sizes (
          size
        )
      )
    `)
    .eq("id", orderId)
    .single();

  if (error || !order) {
    notFound();
  }

  const refCode = order.paystack_reference || order.id.substring(0, 8).toUpperCase();
  const area = (order.address as any)?.area || "Accra";

  return (
    <main className="space-y-6 pt-4 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Live Order Tracking</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-ink tracking-tight">
          Order #{refCode}
        </h1>
        <p className="text-xs sm:text-sm text-ink-dim flex items-center gap-2">
          <span>Scheduled Delivery Slot:</span>
          <strong className="text-brand-gold">{order.delivery_slot}</strong>
          <span>·</span>
          <span>{area}</span>
        </p>
      </div>

      {order.order_status === "cancelled" ? (
        <WarningBox>
          <div className="font-bold text-sm mb-1">This order was cancelled.</div>
          {order.cancellation_reason && (
            <div className="text-xs opacity-90">Reason: {order.cancellation_reason}</div>
          )}
        </WarningBox>
      ) : (
        /* Order Lifecycle Progression */
        <div className="bg-surface2/80 border border-line rounded-3xl p-6 sm:p-8 shadow-lg">
          <OrderStatusSteps currentStatus={order.order_status as any} />
        </div>
      )}

      {/* Delivery Window Banner */}
      <div className="p-4 rounded-2xl bg-surface2/90 border border-brand-gold/30 flex items-center gap-3 text-xs sm:text-sm text-ink shadow-md">
        <Clock className="w-5 h-5 text-brand-gold flex-none" />
        <div>
          Estimated delivery arrival: <strong className="text-brand-gold">{order.delivery_slot} GMT</strong> to your address in {area}.
        </div>
      </div>

      {/* Order Item Details & Receipt */}
      <div className="bg-surface2/80 border border-line rounded-3xl p-6 shadow-md space-y-4">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-gold pb-2 border-b border-line/60">
          <span>Receipt Breakdown</span>
          <span className="text-ok flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Prepaid via Paystack</span>
          </span>
        </div>

        <div className="divide-y divide-line/60 text-xs sm:text-sm">
          {((order.items as any[]) || []).map((item) => (
            <div key={item.id} className="py-3 flex justify-between items-start gap-4">
              <div>
                <span className="font-serif font-bold text-base text-ink">
                  {item.meal?.name || "Meal"}
                </span>
                <div className="text-xs text-brand-gold-soft mt-0.5">
                  {item.size?.size} · {item.included_protein_package_name} · Qty {item.quantity}
                </div>
              </div>
              <span className="font-serif font-bold text-sm text-brand-gold flex-none">
                {formatGHS(item.base_price_pesewas * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Transparent Two-Part Payment Receipt */}
        <div className="pt-4 mt-2 border-t border-line/60 space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between items-center">
            <span className="text-ink">Food Subtotal (Prepaid)</span>
            <span className="font-serif font-bold text-ok">
              {formatGHS(order.subtotal_pesewas)} (Paid)
            </span>
          </div>
          <div className="flex justify-between items-center pt-1 border-t border-line/40">
            <div className="flex items-center gap-1.5 text-ink">
              <Bike className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Delivery Fee (Pay Rider Upon Arrival)</span>
            </div>
            <span className="font-serif font-bold text-brand-yellow">
              {formatGHS(order.delivery_fee_pesewas)}
            </span>
          </div>
        </div>
      </div>

      {/* Instant WhatsApp Support */}
      <a
        href={`https://wa.me/233240000000?text=Hi%20Chef%20Apedo,%20inquiring%20about%20order%20${refCode}`}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <Button
          variant="ghost"
          className="w-full py-3.5 font-bold flex items-center justify-center gap-2 border-line hover:border-brand-gold/40 text-brand-gold"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat on WhatsApp About Order #{refCode}</span>
        </Button>
      </a>
    </main>
  );
}
