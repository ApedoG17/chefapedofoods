"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";
import { WarningBox } from "@/components/ui/WarningBox";
import { formatGHS } from "@/lib/pricing";
import { createClient } from "@/lib/supabase/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function AdminOrderDetailPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
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
            meal:meals (name),
            size:meal_sizes (size)
          )
        `)
        .eq("id", orderId)
        .single();

      if (data && !error) {
        setOrder(data);
      } else {
        setErrorMsg("Order not found or could not be loaded");
      }
    } catch (err: any) {
      setErrorMsg("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleUpdateStatus = async (nextStatus: string, reason?: string) => {
    setUpdating(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: nextStatus,
          cancellationReason: reason,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setErrorMsg(result.error || "Failed to update order status");
      } else {
        await fetchOrder();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred while updating status");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <main className="py-12 text-center text-ink-dim">Loading order details…</main>;
  }

  if (!order) {
    return (
      <main className="space-y-4">
        <WarningBox>{errorMsg || "Order not found"}</WarningBox>
        <Link href="/admin/orders">
          <Button variant="ghost">← Back to Orders</Button>
        </Link>
      </main>
    );
  }

  const ref = order.paystack_reference || order.id.substring(0, 8).toUpperCase();
  const customerName = order.customer?.name || "Customer";
  const customerPhone = order.customer?.phone || "";
  const address = order.address?.address || "";
  const area = order.address?.area || "";

  return (
    <main className="space-y-4 pb-12">
      <div className="flex justify-between items-baseline">
        <div>
          <Link href="/admin/orders" className="text-gold text-[11px] mb-1 inline-block hover:underline">
            ← Back to Orders
          </Link>
          <h1 className="font-serif font-semibold text-[22px] text-ink">
            Order #{ref}
          </h1>
        </div>
        <Badge
          variant={
            order.order_status === "cancelled"
              ? "warn"
              : order.order_status === "delivered" || order.order_status === "confirmed"
              ? "ok"
              : "neutral"
          }
        >
          {order.order_status}
        </Badge>
      </div>

      {errorMsg && <WarningBox>{errorMsg}</WarningBox>}

      {/* Customer Card */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Customer
        </div>
        <div className="flex justify-between items-center text-[13px]">
          <div>
            <div className="font-medium text-ink">{customerName}</div>
            <div className="text-ink-dim">{customerPhone}</div>
          </div>
          <a
            href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, "")}?text=Hi%20${customerName},%20Chef%20Apedo%20here%20regarding%20order%20${ref}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ok text-[11.5px] border border-ok/40 px-2.5 py-1 rounded-full font-medium hover:bg-ok/10"
          >
            WhatsApp
          </a>
        </div>
      </Card>

      {/* Delivery Details Card */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Delivery Details
        </div>
        <Banner className="mb-2">
          Delivery Slot: <strong>{order.delivery_slot}</strong>
        </Banner>
        <div className="text-[13px] text-ink leading-relaxed">
          <div><strong className="text-ink-dim">Area:</strong> {area}</div>
          <div><strong className="text-ink-dim">Address:</strong> {address}</div>
        </div>
      </Card>

      {/* Food Items Card */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Food Items
        </div>
        <div className="divide-y divide-line text-[13px]">
          {order.items?.map((item: any) => (
            <div key={item.id} className="py-2.5 flex justify-between items-center">
              <div>
                <div className="font-medium text-ink">
                  {item.quantity}x {item.meal?.name || "Meal"} ({item.size?.size})
                </div>
                <div className="text-[11px] text-ink-dim">
                  Included protein: {item.included_protein_package_name}
                </div>
              </div>
              <span className="text-gold font-semibold">
                {formatGHS(item.base_price_pesewas * item.quantity)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Payment Card */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Payment &amp; Reconciliation
        </div>
        <div className="divide-y divide-line text-[13px]">
          <div className="flex justify-between py-1.5">
            <span className="text-ink">Paid (Food)</span>
            <span className="text-gold font-semibold">
              {formatGHS(order.subtotal_pesewas)} ({order.payment_status === "paid" ? "Paid ✓" : "Unpaid"})
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-ink">Delivery fee (Due to rider)</span>
            <span className="text-ink font-semibold">{formatGHS(order.delivery_fee_pesewas)}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[11.5px] text-ink-dim">
            <span>Paystack Reference</span>
            <span className="font-mono">{ref}</span>
          </div>
        </div>
      </Card>

      {/* Order Status Action Controls */}
      <Card>
        <div className="text-[10px] tracking-[0.1em] uppercase text-gold font-semibold mb-2">
          Advance Order Status
        </div>

        {order.order_status === "confirmed" && (
          <div className="space-y-2">
            <Button
              variant="primary"
              className="w-full"
              disabled={updating}
              onClick={() => handleUpdateStatus("preparing")}
            >
              Start Preparing
            </Button>
            <Button
              variant="ghost"
              className="w-full text-warn hover:border-warn"
              disabled={updating}
              onClick={() => {
                const reason = window.prompt("Reason for cancellation:", "Customer request");
                if (reason) handleUpdateStatus("cancelled", reason);
              }}
            >
              Cancel Order
            </Button>
          </div>
        )}

        {order.order_status === "preparing" && (
          <Button
            variant="primary"
            className="w-full"
            disabled={updating}
            onClick={() => handleUpdateStatus("ready_for_dispatch")}
          >
            Mark Ready for Dispatch
          </Button>
        )}

        {order.order_status === "ready_for_dispatch" && (
          <Button
            variant="primary"
            className="w-full"
            disabled={updating}
            onClick={() => handleUpdateStatus("dispatched")}
          >
            Dispatch to Rider
          </Button>
        )}

        {order.order_status === "dispatched" && (
          <Button
            variant="primary"
            className="w-full"
            disabled={updating}
            onClick={() => handleUpdateStatus("delivered")}
          >
            Mark Delivered
          </Button>
        )}

        {order.order_status === "delivered" && (
          <Banner className="text-center font-medium text-ok">
            ✓ Order delivered successfully.
          </Banner>
        )}

        {order.order_status === "cancelled" && (
          <WarningBox>
            This order has been cancelled.
            {order.cancellation_reason && (
              <div className="mt-1 text-[11px]">Reason: {order.cancellation_reason}</div>
            )}
          </WarningBox>
        )}
      </Card>
    </main>
  );
}
