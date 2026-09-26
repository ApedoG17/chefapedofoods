import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ConfirmationCheckmark } from "@/components/ui/ConfirmationCheckmark";
import { Card } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { formatGHS } from "@/lib/pricing";

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
  searchParams: Promise<{ [key: string]: string | undefined }> | { [key: string]: string | undefined };
}

export default async function OrderConfirmedPage(props: PageProps) {
  const resolvedParams = await Promise.resolve(props.params);
  const resolvedSearchParams = await Promise.resolve(props.searchParams);
  const orderId = resolvedParams.id;
  const isMock = resolvedSearchParams.mock === "true";

  const adminSupabase = createAdminClient();

  // If in mock testing mode, update order status to confirmed and payment to paid
  if (isMock) {
    await adminSupabase
      .from("orders")
      .update({
        order_status: "confirmed",
        payment_status: "paid",
        amount_paid_pesewas: 7000,
      })
      .eq("id", orderId);
  }

  // Fetch order details
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

  const customerName = (order.customer as any)?.name || "Customer";
  const area = (order.address as any)?.area || "Accra";
  const refCode = order.paystack_reference || order.id.substring(0, 8).toUpperCase();

  return (
    <main className="space-y-4 pt-4 pb-12">
      <div className="text-center">
        <ConfirmationCheckmark />
        <h1 className="font-serif font-semibold text-[24px] text-ink mb-1">
          Order Confirmed
        </h1>
        <p className="text-[12.5px] text-ink-dim">
          Thank you, {customerName} — Order #{refCode}
        </p>
      </div>

      {/* Items Summary Card */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Your Meal
        </div>
        <div className="divide-y divide-line">
          {((order.items as any[]) || []).map((item) => (
            <div key={item.id} className="py-2 flex justify-between items-center text-[13px]">
              <div>
                <span className="font-medium text-ink">{item.meal?.name || "Meal"}</span>
                <div className="text-[11px] text-ink-dim">
                  Size: {item.size?.size} · {item.included_protein_package_name} · Qty: {item.quantity}
                </div>
              </div>
              <span className="text-gold font-medium">
                {formatGHS(item.base_price_pesewas * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Delivery & Split Payment Card */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Delivery Details
        </div>
        <Banner className="mb-2">
          Slot: {order.delivery_slot} · {area}
        </Banner>
        <div className="divide-y divide-line text-[13px]">
          <div className="flex justify-between py-1.5">
            <span className="text-ink">Paid now (Food)</span>
            <span className="text-gold font-semibold">{formatGHS(order.subtotal_pesewas)} ✓</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-ink">To pay rider on arrival</span>
            <span className="text-ink font-semibold">{formatGHS(order.delivery_fee_pesewas)}</span>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <Link href={`/orders/${order.id}`} className="flex-1">
          <Button variant="primary" className="w-full">
            Track Order
          </Button>
        </Link>
        <a
          href={`https://wa.me/233240000000?text=Hi%20Chef%20Apedo,%20inquiring%20about%20order%20${refCode}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="ghost" className="w-full">
            WhatsApp
          </Button>
        </a>
      </div>
    </main>
  );
}
